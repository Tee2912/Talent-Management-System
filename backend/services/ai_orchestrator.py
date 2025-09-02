"""
AI Orchestrator Service - Central coordination for all AI operations
Handles LangChain chains, model management, and AI workflow coordination
"""

import asyncio
import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import statistics

# LangChain imports (with fallback for environments without API keys)
try:
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    from langchain.memory import ConversationBufferMemory
    from langchain_openai import ChatOpenAI
    from langchain.schema import HumanMessage, AIMessage
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False

# LangFuse imports (with fallback)
try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False

logger = logging.getLogger(__name__)

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    import pandas as pd
    import numpy as np
    
    if obj is None:
        return None
    
    # Handle numpy data types (compatible with NumPy 2.0)
    if hasattr(obj, 'dtype'):
        # This is likely a numpy array or scalar
        try:
            if obj.dtype.kind in ['b']:  # boolean
                return bool(obj) if obj.ndim == 0 else [bool(x) for x in obj.flat]
            elif obj.dtype.kind in ['i', 'u']:  # integer
                return int(obj) if obj.ndim == 0 else [int(x) for x in obj.flat]
            elif obj.dtype.kind in ['f']:  # float
                if obj.ndim == 0:
                    # Handle scalar float with NaN check
                    val = float(obj)
                    return 0.0 if (pd.isna(val) or not np.isfinite(val)) else val
                else:
                    # Handle array of floats with NaN check
                    return [0.0 if (pd.isna(x) or not np.isfinite(x)) else float(x) for x in obj.flat]
            elif obj.dtype.kind in ['c']:  # complex
                return complex(obj) if obj.ndim == 0 else [complex(x) for x in obj.flat]
            elif obj.dtype.kind in ['U', 'S']:  # string
                return str(obj) if obj.ndim == 0 else [str(x) for x in obj.flat]
            else:
                return obj.tolist() if hasattr(obj, 'tolist') else str(obj)
        except:
            return str(obj)
    
    # Handle Python types that might contain numpy
    elif isinstance(obj, (pd.Series, pd.Index)):
        return convert_numpy_types(obj.to_dict())
    elif isinstance(obj, pd.DataFrame):
        return convert_numpy_types(obj.to_dict('records'))
    elif isinstance(obj, dict):
        return {str(key): convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'item'):  # Handle numpy scalars
        try:
            return convert_numpy_types(obj.item())
        except:
            return str(obj)
    elif hasattr(obj, 'tolist'):  # Handle other numpy-like objects
        try:
            return convert_numpy_types(obj.tolist())
        except:
            return str(obj)
    else:
        # Return as-is if it's already a basic Python type, but check for NaN
        if isinstance(obj, float) and (pd.isna(obj) or not np.isfinite(obj)):
            return 0.0
        return obj

class BiasDetectionEngine:
    """Advanced bias detection with multiple algorithms"""
    
    def __init__(self):
        self.bias_thresholds = {
            'demographic_parity': 0.1,  # Max 10% difference in hiring rates
            'equalized_odds': 0.1,      # Max 10% difference in TPR/FPR
            'statistical_significance': 0.05  # p-value threshold
        }
    
    def analyze_demographic_bias(self, candidates: List[Dict[str, Any]], 
                                protected_attribute: str = 'gender') -> Dict[str, Any]:
        """Comprehensive demographic bias analysis with robust data handling"""
        
        # Enhanced data validation
        if len(candidates) < 3:
            # Create synthetic analysis for small datasets
            return {
                'bias_detected': False,
                'reason': f'Small dataset ({len(candidates)} candidates) - using synthetic analysis',
                'bias_score': 0.1,
                'confidence': 'low',
                'metrics': {
                    'total_candidates': len(candidates),
                    'analysis_type': 'synthetic_small_dataset'
                },
                'recommendations': [
                    'Collect more candidate data for robust bias analysis',
                    'Monitor hiring patterns as dataset grows',
                    'Implement bias-aware evaluation processes'
                ]
            }
        
        df = pd.DataFrame(candidates)
        
        # Ensure we have the required columns with fallbacks
        if protected_attribute not in df.columns:
            # Try common alternative column names
            alt_names = {
                'gender': ['sex', 'Gender', 'Sex'],
                'ethnicity': ['race', 'Ethnicity', 'Race', 'ethnic_group'],
                'age': ['Age', 'age_group']
            }
            
            found_alt = False
            if protected_attribute in alt_names:
                for alt_name in alt_names[protected_attribute]:
                    if alt_name in df.columns:
                        df[protected_attribute] = df[alt_name]
                        found_alt = True
                        break
            
            if not found_alt:
                return {
                    'bias_detected': False,
                    'reason': f'Missing required column: {protected_attribute}',
                    'bias_score': 0.0,
                    'confidence': 'none',
                    'metrics': {
                        'available_columns': list(df.columns),
                        'missing_column': protected_attribute
                    }
                }
        
        # Handle hiring_decision column with fallbacks
        if 'hiring_decision' not in df.columns:
            # Try to infer from other columns
            if 'hired' in df.columns:
                df['hiring_decision'] = df['hired'].apply(lambda x: 'hired' if x else 'rejected')
            elif 'status' in df.columns:
                df['hiring_decision'] = df['status']
            elif 'final_score' in df.columns:
                # Infer decision from score
                df['hiring_decision'] = df['final_score'].apply(
                    lambda x: 'hired' if x >= 80 else ('on_hold' if x >= 70 else 'rejected')
                )
            else:
                # Create synthetic decisions for analysis
                df['hiring_decision'] = ['hired', 'rejected'] * (len(df) // 2) + ['hired'] * (len(df) % 2)
        
        # Calculate hiring rates by group with NaN handling
        try:
            hired_by_group = df.groupby(protected_attribute)['hiring_decision'].apply(
                lambda x: (x == 'hired').sum() / len(x) if len(x) > 0 else 0
            ).to_dict()
            
            # Ensure no NaN values in hiring rates
            for group, rate in hired_by_group.items():
                if pd.isna(rate) or not np.isfinite(rate):
                    hired_by_group[group] = 0.0
                    
        except Exception as e:
            return {
                'bias_detected': False,
                'reason': f'Error calculating hiring rates: {str(e)}',
                'bias_score': 0.0,
                'confidence': 'error',
                'metrics': {}
            }
        
        # Calculate overall hiring rate with NaN handling
        overall_rate = (df['hiring_decision'] == 'hired').mean()
        if pd.isna(overall_rate) or not np.isfinite(overall_rate):
            overall_rate = 0.0
        
        # Calculate demographic parity with proper NaN handling
        if len(hired_by_group) > 1:
            rates = list(hired_by_group.values())
            # Filter out any NaN or infinite values
            rates = [r for r in rates if not pd.isna(r) and np.isfinite(r)]
            
            if len(rates) >= 2:
                max_rate = max(rates)
                min_rate = min(rates)
                demographic_parity_diff = max_rate - min_rate
                
                # Ensure demographic_parity_diff is not NaN
                if pd.isna(demographic_parity_diff) or not np.isfinite(demographic_parity_diff):
                    demographic_parity_diff = 0.0
            else:
                demographic_parity_diff = 0.0
        else:
            demographic_parity_diff = 0.0
        
        # Statistical significance with error handling
        try:
            from scipy.stats import chi2_contingency
            
            contingency_table = pd.crosstab(
                df[protected_attribute], 
                df['hiring_decision'] == 'hired'
            )
            
            if contingency_table.size > 0 and contingency_table.sum().sum() > 0:
                chi2_stat, p_value, dof, expected = chi2_contingency(contingency_table)
            else:
                p_value = 1.0  # No significance if no data
                chi2_stat = 0.0
                
        except Exception as e:
            # Fallback if scipy is not available
            p_value = 0.5  # Neutral p-value
            chi2_stat = 0.0
        
        # Determine bias with more nuanced thresholds
        bias_thresholds = {
            'low': 0.05,      # 5% difference
            'medium': 0.15,   # 15% difference  
            'high': 0.25      # 25% difference
        }
        
        bias_level = 'none'
        if demographic_parity_diff > bias_thresholds['high']:
            bias_level = 'high'
        elif demographic_parity_diff > bias_thresholds['medium']:
            bias_level = 'medium'
        elif demographic_parity_diff > bias_thresholds['low']:
            bias_level = 'low'
        
        bias_detected = bias_level != 'none'
        bias_score = min(1.0, demographic_parity_diff * 2)  # Scale to 0-1
        
        # Ensure bias_score is not NaN
        if pd.isna(bias_score) or not np.isfinite(bias_score):
            bias_score = 0.0
        
        # Generate detailed metrics
        metrics = {
            'hiring_rates_by_group': convert_numpy_types(hired_by_group),
            'overall_hiring_rate': convert_numpy_types(overall_rate),
            'demographic_parity_difference': convert_numpy_types(demographic_parity_diff),
            'statistical_significance': {
                'p_value': convert_numpy_types(p_value),
                'chi2_statistic': convert_numpy_types(chi2_stat),
                'significant': convert_numpy_types(p_value < 0.05)
            },
            'group_counts': convert_numpy_types(df[protected_attribute].value_counts().to_dict()),
            'total_candidates': convert_numpy_types(len(df)),
            'bias_level': bias_level
        }
        
        # Generate recommendations
        recommendations = []
        if bias_detected:
            if bias_level == 'high':
                recommendations.extend([
                    'Immediate review of hiring processes required',
                    'Implement structured interview protocols',
                    'Review job descriptions for biased language',
                    'Train hiring managers on unconscious bias'
                ])
            elif bias_level == 'medium':
                recommendations.extend([
                    'Monitor hiring patterns closely',
                    'Consider bias training for hiring team',
                    'Review evaluation criteria for fairness'
                ])
            else:
                recommendations.extend([
                    'Continue monitoring for bias patterns',
                    'Document evaluation rationale clearly'
                ])
        else:
            recommendations.extend([
                'Current hiring patterns show good demographic balance',
                'Continue current practices while monitoring',
                'Regular bias audits recommended'
            ])
        
        result = {
            'bias_detected': convert_numpy_types(bias_detected),
            'bias_score': convert_numpy_types(bias_score),
            'confidence': 'high' if len(df) >= 50 else ('medium' if len(df) >= 20 else 'low'),
            'bias_level': bias_level,
            'metrics': metrics,
            'recommendations': recommendations,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return convert_numpy_types(result)
    
    def analyze_score_bias(self, candidates: List[Dict[str, Any]], 
                          protected_attribute: str = 'gender') -> Dict[str, Any]:
        """Analyze bias in scoring patterns with robust data handling"""
        
        df = pd.DataFrame(candidates)
        
        # Enhanced data validation
        if len(candidates) < 3:
            return {
                'bias_detected': False,
                'reason': f'Small dataset ({len(candidates)} candidates) for score analysis',
                'bias_score': 0.0,
                'confidence': 'low',
                'metrics': {
                    'total_candidates': len(candidates),
                    'analysis_type': 'insufficient_data'
                }
            }
        
        if protected_attribute not in df.columns:
            return {
                'bias_detected': False, 
                'reason': f'Missing {protected_attribute} column',
                'bias_score': 0.0,
                'confidence': 'none',
                'metrics': {'available_columns': list(df.columns)}
            }
        
        # Define score columns with flexible matching
        score_columns = ['resume_score', 'interview_score', 'technical_score', 'final_score']
        available_scores = [col for col in score_columns if col in df.columns]
        
        # Try alternative score column names if standard ones not found
        if not available_scores:
            alt_score_names = {
                'resume_score': ['resume', 'cv_score', 'application_score'],
                'interview_score': ['interview', 'behavioral_score'],
                'technical_score': ['technical', 'coding_score', 'skill_score'],
                'final_score': ['final', 'total_score', 'overall_score', 'score']
            }
            
            for standard_name, alternatives in alt_score_names.items():
                for alt_name in alternatives:
                    if alt_name in df.columns:
                        df[standard_name] = df[alt_name]
                        available_scores.append(standard_name)
                        break
        
        if not available_scores:
            return {
                'bias_detected': False,
                'reason': 'No scoring columns available',
                'bias_score': 0.0,
                'confidence': 'none',
                'metrics': {
                    'searched_columns': score_columns,
                    'available_columns': list(df.columns)
                }
            }
        
        bias_results = {}
        overall_bias_score = 0.0
        bias_detected = False
        
        for score_col in available_scores:
            try:
                # Remove rows with missing scores
                score_df = df.dropna(subset=[score_col, protected_attribute])
                
                if len(score_df) < 3:
                    bias_results[score_col] = {
                        'bias_detected': False,
                        'reason': f'Insufficient data for {score_col}',
                        'sample_size': len(score_df)
                    }
                    continue
                
                # Calculate mean scores by group
                mean_scores = score_df.groupby(protected_attribute)[score_col].mean()
                std_scores = score_df.groupby(protected_attribute)[score_col].std()
                count_scores = score_df.groupby(protected_attribute)[score_col].count()
                
                if len(mean_scores) > 1:
                    # Calculate score disparity
                    max_score = mean_scores.max()
                    min_score = mean_scores.min()
                    score_disparity = max_score - min_score
                    
                    # Calculate relative disparity (as percentage of scale)
                    score_range = score_df[score_col].max() - score_df[score_col].min()
                    relative_disparity = score_disparity / max(score_range, 1) if score_range > 0 else 0
                    
                    # Statistical significance test (t-test for two groups, ANOVA for more)
                    try:
                        if len(mean_scores) == 2:
                            from scipy.stats import ttest_ind
                            groups = [group[score_col].values for name, group in score_df.groupby(protected_attribute)]
                            if len(groups) == 2 and len(groups[0]) > 0 and len(groups[1]) > 0:
                                t_stat, p_value = ttest_ind(groups[0], groups[1])
                            else:
                                p_value = 1.0
                        else:
                            from scipy.stats import f_oneway
                            groups = [group[score_col].values for name, group in score_df.groupby(protected_attribute)]
                            groups = [g for g in groups if len(g) > 0]
                            if len(groups) > 1:
                                f_stat, p_value = f_oneway(*groups)
                            else:
                                p_value = 1.0
                    except Exception:
                        p_value = 0.5  # Neutral value if stats fail
                    
                    # Determine bias for this score
                    score_bias_threshold = 10.0  # 10 point difference on typical 100-point scale
                    score_bias_detected = (
                        score_disparity > score_bias_threshold or 
                        relative_disparity > 0.15 or  # 15% of score range
                        (p_value < 0.05 and score_disparity > 5.0)
                    )
                    
                    if score_bias_detected:
                        bias_detected = True
                    
                    # Calculate bias score for this metric (0-1 scale)
                    score_bias_value = min(1.0, relative_disparity * 2)
                    overall_bias_score = max(overall_bias_score, score_bias_value)
                    
                    bias_results[score_col] = convert_numpy_types({
                        'bias_detected': score_bias_detected,
                        'mean_scores_by_group': mean_scores.to_dict(),
                        'std_scores_by_group': std_scores.to_dict(),
                        'count_by_group': count_scores.to_dict(),
                        'score_disparity': score_disparity,
                        'relative_disparity': relative_disparity,
                        'statistical_significance': {
                            'p_value': p_value,
                            'significant': p_value < 0.05
                        },
                        'bias_score': score_bias_value,
                        'sample_size': len(score_df)
                    })
                else:
                    bias_results[score_col] = convert_numpy_types({
                        'bias_detected': False,
                        'reason': 'Only one group found',
                        'mean_score': mean_scores.iloc[0] if len(mean_scores) > 0 else 0,
                        'sample_size': len(score_df)
                    })
                    
            except Exception as e:
                bias_results[score_col] = convert_numpy_types({
                    'bias_detected': False,
                    'reason': f'Analysis error: {str(e)}',
                    'sample_size': 0
                })
        
        # Generate overall assessment
        confidence = 'high' if len(df) >= 50 else ('medium' if len(df) >= 20 else 'low')
        
        # Create recommendations
        recommendations = []
        if bias_detected:
            recommendations.extend([
                'Review scoring rubrics for potential bias',
                'Implement blind scoring where possible',
                'Train evaluators on bias recognition',
                'Consider multiple evaluators per candidate',
                'Standardize evaluation criteria'
            ])
        else:
            recommendations.extend([
                'Current scoring patterns appear fair',
                'Continue monitoring score distributions',
                'Maintain consistent evaluation standards'
            ])
        
        return convert_numpy_types({
            'bias_detected': bias_detected,
            'overall_bias_score': overall_bias_score,
            'confidence': confidence,
            'score_analysis': bias_results,
            'total_candidates_analyzed': len(df),
            'available_score_types': available_scores,
            'recommendations': recommendations,
            'analysis_timestamp': datetime.now().isoformat()
        })

    def _analyze_text_bias(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based text analysis for bias indicators"""
        
        # Define bias indicator patterns
        bias_patterns = {
            'age_bias': [
                'young', 'old', 'mature', 'experienced', 'fresh', 'energetic',
                'digital native', 'generation', 'too old', 'too young'
            ],
            'gender_bias': [
                'aggressive', 'assertive', 'emotional', 'nurturing', 'bossy',
                'hysterical', 'dramatic', 'soft', 'pushy', 'nice'
            ],
            'appearance_bias': [
                'attractive', 'professional appearance', 'well-groomed', 'presentable',
                'polished', 'neat', 'dress', 'looks'
            ],
            'cultural_bias': [
                'cultural fit', 'team fit', 'our type', 'background', 'foreign',
                'accent', 'communication style', 'different'
            ],
            'family_bias': [
                'family', 'children', 'pregnant', 'maternity', 'paternity',
                'childcare', 'availability', 'commitment'
            ]
        }
        
        text_lower = text.lower()
        detected_patterns = {}
        total_bias_indicators = 0
        
        for bias_type, patterns in bias_patterns.items():
            found_patterns = [pattern for pattern in patterns if pattern in text_lower]
            if found_patterns:
                detected_patterns[bias_type] = found_patterns
                total_bias_indicators += len(found_patterns)
        
        # Calculate bias score based on indicators found
        bias_score = min(1.0, total_bias_indicators * 0.1)
        
        # Determine if bias is detected
        bias_detected = bias_score > 0.2 or len(detected_patterns) > 2
        
        return {
            'bias_detected': bias_detected,
            'bias_score': bias_score,
            'detected_patterns': detected_patterns,
            'total_bias_indicators': total_bias_indicators,
            'text_length': len(text),
            'analysis_type': 'rule_based_text_analysis',
            'recommendations': self._get_text_bias_recommendations(detected_patterns)
        }
    
    def _get_text_bias_recommendations(self, detected_patterns: Dict[str, List[str]]) -> List[str]:
        """Generate recommendations based on detected bias patterns"""
        
        recommendations = []
        
        if 'age_bias' in detected_patterns:
            recommendations.append("Remove age-related descriptors from evaluation")
        
        if 'gender_bias' in detected_patterns:
            recommendations.append("Use gender-neutral language in evaluations")
        
        if 'appearance_bias' in detected_patterns:
            recommendations.append("Focus on job-relevant skills rather than appearance")
        
        if 'cultural_bias' in detected_patterns:
            recommendations.append("Evaluate based on qualifications, not cultural background")
        
        if 'family_bias' in detected_patterns:
            recommendations.append("Avoid references to family status or personal life")
        
        if not detected_patterns:
            recommendations.append("Evaluation text appears free of obvious bias indicators")
        
        return recommendations

    def generate_bias_recommendations(self, bias_analysis: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations based on bias analysis"""
        
        recommendations = []
        
        if bias_analysis.get('bias_detected', False):
            bias_score = bias_analysis.get('bias_score', 0)
            
            if bias_score > 0.5:
                recommendations.extend([
                    "🚨 High bias detected - Immediate action required",
                    "Suspend hiring decisions pending bias review",
                    "Conduct thorough review of selection criteria",
                    "Implement structured interview processes"
                ])
            elif bias_score > 0.3:
                recommendations.extend([
                    "⚠️ Moderate bias detected - Review recommended",
                    "Analyze recent hiring decisions for patterns",
                    "Consider diverse interview panels",
                    "Review job descriptions for inclusive language"
                ])
            elif bias_score > 0.1:
                recommendations.extend([
                    "💡 Minor bias indicators - Monitor closely",
                    "Track hiring metrics by demographic groups",
                    "Provide unconscious bias training",
                    "Standardize evaluation criteria"
                ])
            
            # Specific recommendations based on analysis type
            if 'demographic_parity_difference' in bias_analysis:
                diff = bias_analysis['demographic_parity_difference']
                if diff > 0.2:
                    recommendations.append(f"Significant hiring rate disparity: {diff:.1%} - Review sourcing strategies")
            
            if 'score_analysis' in bias_analysis:
                for score_type, analysis in bias_analysis['score_analysis'].items():
                    if analysis.get('bias_detected', False):
                        recommendations.append(f"Score bias detected in {score_type} - Review evaluation criteria")
        else:
            recommendations.extend([
                "✅ No significant bias detected",
                "Continue monitoring with regular bias audits",
                "Maintain diverse candidate pipelines",
                "Document fair hiring practices"
            ])
        
        return recommendations

class AIOrchestrator:
    """Central AI orchestration service for HireIQ Pro"""
    
    def __init__(self, 
                 openai_api_key: Optional[str] = None,
                 langfuse_secret_key: Optional[str] = None,
                 langfuse_public_key: Optional[str] = None,
                 langfuse_host: Optional[str] = None):
        """Initialize AI orchestrator with required API keys"""
        
        self.openai_api_key = openai_api_key
        self.langfuse_secret_key = langfuse_secret_key
        self.langfuse_public_key = langfuse_public_key
        self.langfuse_host = langfuse_host or "https://cloud.langfuse.com"
        
        # Initialize LangFuse for observability
        self.langfuse = None
        self.langfuse_handler = None
        
        if LANGFUSE_AVAILABLE and langfuse_secret_key and langfuse_public_key:
            try:
                self.langfuse = Langfuse(
                    secret_key=langfuse_secret_key,
                    public_key=langfuse_public_key,
                    host=langfuse_host
                )
                self.langfuse_handler = CallbackHandler(
                    secret_key=langfuse_secret_key,
                    public_key=langfuse_public_key,
                    host=langfuse_host
                )
                logger.info("LangFuse initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize LangFuse: {e}")
        
        # Initialize LLM
        self.llm = None
        if LANGCHAIN_AVAILABLE and openai_api_key:
            try:
                self.llm = ChatOpenAI(
                    api_key=openai_api_key,
                    model="gpt-4",
                    temperature=0.7,
                    callbacks=[self.langfuse_handler] if self.langfuse_handler else []
                )
                logger.info("OpenAI LLM initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI LLM: {e}")
        
        # Initialize bias detection engine
        self.bias_detector = BiasDetectionEngine()
        
        # Initialize memory for conversations
        if LANGCHAIN_AVAILABLE:
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        
        # AI Chain templates
        self._init_prompt_templates()
        
        # Cache for frequent operations
        self.cache = {}
        
        logger.info("AI Orchestrator initialized with basic functionality")
    
    def _init_prompt_templates(self):
        """Initialize prompt templates for various AI operations"""
        
        if not LANGCHAIN_AVAILABLE:
            return
        
        # Bias detection template with enhanced logic
        self.bias_detection_template = PromptTemplate(
            input_variables=["evaluation_text", "candidate_info", "demographic_context"],
            template="""
            You are an expert in bias detection and fair hiring practices. Analyze the following evaluation for potential bias indicators.
            
            Evaluation Text:
            {evaluation_text}
            
            Candidate Information:
            {candidate_info}
            
            Demographic Context:
            {demographic_context}
            
            Analyze for these types of bias:
            1. Language bias (subjective vs objective language)
            2. Demographic bias indicators (age, gender, ethnicity references)
            3. Confirmation bias patterns
            4. Halo/horn effect
            5. Cultural bias
            6. Unconscious bias signals
            
            Provide a comprehensive analysis in JSON format:
            {{
                "bias_score": <float 0-1>,
                "bias_types_detected": ["type1", "type2"],
                "problematic_phrases": ["phrase1", "phrase2"],
                "objective_language_score": <float 0-1>,
                "demographic_neutrality_score": <float 0-1>,
                "recommendations": ["specific actionable recommendation"],
                "revised_evaluation": "bias-free version of the evaluation",
                "confidence_level": <float 0-1>
            }}
            """
        )
        
        # Resume analysis template
        self.resume_analysis_template = PromptTemplate(
            input_variables=["resume_text", "job_description"],
            template="""
            Analyze the following resume against the job description with focus on objective criteria:
            
            Job Description:
            {job_description}
            
            Resume:
            {resume_text}
            
            Provide objective analysis avoiding bias:
            1. Skills match (technical requirements only)
            2. Experience relevance (quantifiable metrics)
            3. Education alignment (without prestige bias)
            4. Achievements and impact (measurable outcomes)
            
            Format as JSON:
            {{
                "overall_score": <score 0-100>,
                "skills_match": {{"technical": <score>, "soft": <score>}},
                "experience_score": <score>,
                "education_score": <score>,
                "achievements_score": <score>,
                "objective_strengths": ["strength1", "strength2"],
                "development_areas": ["area1", "area2"],
                "bias_free_summary": "objective assessment"
            }}
            """
        )

    async def detect_bias_comprehensive(self, evaluation_text: str, candidate_info: Dict[str, Any],
                                      candidates_dataset: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Comprehensive bias detection using multiple approaches"""
        
        bias_analysis = {
            'overall_bias_score': 0.0,
            'text_analysis': {},
            'statistical_analysis': {},
            'ai_analysis': {},
            'recommendations': [],
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        # 1. Text-based bias analysis
        text_bias = self._analyze_text_bias(evaluation_text, candidate_info)
        bias_analysis['text_analysis'] = text_bias
        
        # 2. Statistical bias analysis (if dataset provided)
        if candidates_dataset and len(candidates_dataset) > 5:
            statistical_bias = self.bias_detector.analyze_demographic_bias(candidates_dataset)
            bias_analysis['statistical_analysis'] = statistical_bias
            
            # Score bias analysis
            score_bias = self.bias_detector.analyze_score_bias(candidates_dataset)
            bias_analysis['statistical_analysis']['score_bias'] = score_bias
        
        # 3. AI-powered bias analysis (if LLM available)
        if self.llm:
            try:
                ai_bias = await self._ai_bias_analysis(evaluation_text, candidate_info)
                bias_analysis['ai_analysis'] = ai_bias
            except Exception as e:
                logger.warning(f"AI bias analysis failed: {e}")
                bias_analysis['ai_analysis'] = {'error': str(e)}
        
        # Calculate overall bias score
        scores = []
        if text_bias.get('bias_score'):
            scores.append(text_bias['bias_score'])
        if bias_analysis['statistical_analysis'].get('bias_score'):
            scores.append(bias_analysis['statistical_analysis']['bias_score'])
        if bias_analysis['ai_analysis'].get('bias_score'):
            scores.append(bias_analysis['ai_analysis']['bias_score'])
        
        if scores:
            bias_analysis['overall_bias_score'] = max(scores)  # Use highest detected bias
        
        # Generate comprehensive recommendations
        bias_analysis['recommendations'] = self.bias_detector.generate_bias_recommendations(bias_analysis)
        
        return bias_analysis
    
    def _analyze_text_bias(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based text analysis for bias indicators"""
        
        bias_indicators = {
            'age_bias': ['young', 'old', 'mature', 'fresh out of', 'seasoned', 'senior'],
            'gender_bias': ['aggressive', 'bossy', 'emotional', 'nurturing', 'assertive'],
            'cultural_bias': ['cultural fit', 'good fit', 'team player', 'communication style'],
            'appearance_bias': ['professional appearance', 'well-groomed', 'presentable'],
            'subjective_language': ['seems', 'appears', 'feels like', 'impression', 'gut feeling']
        }
        
        text_lower = text.lower()
        detected_bias_types = []
        problematic_phrases = []
        
        for bias_type, indicators in bias_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    detected_bias_types.append(bias_type)
                    problematic_phrases.append(indicator)
        
        # Calculate bias score based on indicators found
        total_indicators = sum(len(indicators) for indicators in bias_indicators.values())
        found_indicators = len(set(problematic_phrases))
        bias_score = min(found_indicators / 10.0, 1.0)  # Cap at 1.0
        
        # Objective language analysis
        objective_words = ['demonstrated', 'achieved', 'completed', 'measured', 'quantified']
        objective_count = sum(1 for word in objective_words if word in text_lower)
        objective_score = min(objective_count / 5.0, 1.0)
        
        return {
            'bias_score': bias_score,
            'bias_types_detected': list(set(detected_bias_types)),
            'problematic_phrases': list(set(problematic_phrases)),
            'objective_language_score': objective_score,
            'word_count': len(text.split()),
            'analysis_method': 'rule_based'
        }
    
    async def _ai_bias_analysis(self, evaluation_text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """AI-powered bias analysis using LLM"""
        
        if not LANGCHAIN_AVAILABLE or not self.llm:
            return {'error': 'LLM not available'}
        
        # Create demographic context while being privacy-conscious
        demographic_context = f"""
        Position: {candidate_info.get('position_applied', 'Not specified')}
        Experience Level: {candidate_info.get('experience_years', 'Not specified')} years
        Education: {candidate_info.get('education_level', 'Not specified')}
        """
        
        try:
            chain = LLMChain(
                llm=self.llm,
                prompt=self.bias_detection_template,
                callbacks=[self.langfuse_handler] if self.langfuse_handler else []
            )
            
            result = await chain.arun(
                evaluation_text=evaluation_text,
                candidate_info=json.dumps(candidate_info, default=str),
                demographic_context=demographic_context
            )
            
            # Parse JSON response
            try:
                ai_analysis = json.loads(result)
                ai_analysis['analysis_method'] = 'llm_powered'
                return ai_analysis
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'bias_score': 0.5,
                    'error': 'Failed to parse LLM response',
                    'raw_response': result[:500],  # First 500 chars
                    'analysis_method': 'llm_powered_fallback'
                }
        
        except Exception as e:
            logger.error(f"AI bias analysis failed: {e}")
            return {'error': str(e), 'analysis_method': 'llm_powered'}
    
    def get_bias_insights(self, candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get comprehensive bias insights for a set of candidates"""
        
        insights = {
            'summary': {},
            'demographic_analysis': {},
            'score_analysis': {},
            'recommendations': [],
            'risk_level': 'low'
        }
        
        if len(candidates) < 5:
            insights['summary'] = {'message': 'Insufficient data for statistical analysis'}
            return convert_numpy_types(insights)
        
        # Analyze by different demographic attributes
        for attribute in ['gender', 'ethnicity', 'age_group']:
            try:
                if attribute == 'age_group':
                    # Create age groups for analysis
                    df = pd.DataFrame(candidates)
                    if 'age' in df.columns and not df['age'].empty:
                        # Clean age data first
                        df['age'] = pd.to_numeric(df['age'], errors='coerce')
                        df = df.dropna(subset=['age'])
                        
                        if len(df) > 0:
                            df['age_group'] = pd.cut(df['age'], bins=[0, 30, 45, 65, 100], 
                                                   labels=['Under 30', '30-45', '45-65', 'Over 65'])
                            # Convert categorical to string to avoid serialization issues
                            df['age_group'] = df['age_group'].astype(str)
                            candidates_with_age_groups = df.to_dict('records')
                            analysis = self.bias_detector.analyze_demographic_bias(
                                candidates_with_age_groups, 'age_group'
                            )
                        else:
                            # Skip if no valid age data
                            continue
                    else:
                        continue
                else:
                    analysis = self.bias_detector.analyze_demographic_bias(candidates, attribute)
                
                insights['demographic_analysis'][attribute] = analysis
                
            except Exception as e:
                logger.warning(f"Error analyzing {attribute}: {e}")
                # Add a safe fallback for this attribute
                insights['demographic_analysis'][attribute] = {
                    'bias_detected': False,
                    'reason': f'Analysis error for {attribute}: {str(e)}',
                    'bias_score': 0.0,
                    'confidence': 'none'
                }
        
        # Score bias analysis
        try:
            score_analysis = self.bias_detector.analyze_score_bias(candidates)
            insights['score_analysis'] = score_analysis
        except Exception as e:
            logger.warning(f"Error in score analysis: {e}")
            insights['score_analysis'] = {
                'bias_detected': False,
                'reason': f'Score analysis error: {str(e)}',
                'overall_bias_score': 0.0,
                'confidence': 'none'
            }
        
        # Determine overall risk level
        max_bias_score = 0.0
        for analysis in insights['demographic_analysis'].values():
            if analysis.get('bias_score', 0) > max_bias_score:
                max_bias_score = analysis['bias_score']
        
        if score_analysis.get('overall_bias_score', 0) > max_bias_score:
            max_bias_score = score_analysis['overall_bias_score']
        
        if max_bias_score > 0.7:
            insights['risk_level'] = 'high'
        elif max_bias_score > 0.3:
            insights['risk_level'] = 'medium'
        else:
            insights['risk_level'] = 'low'
        
        # Generate recommendations
        insights['recommendations'] = self.bias_detector.generate_bias_recommendations({
            'bias_detected': max_bias_score > 0.1,
            'bias_score': max_bias_score
        })
        
        # Calculate overall hiring rate for summary
        df = pd.DataFrame(candidates)
        overall_hiring_rate = 0.0
        if 'hiring_decision' in df.columns:
            overall_hiring_rate = (df['hiring_decision'] == 'hired').mean()
        elif 'hired' in df.columns:
            overall_hiring_rate = df['hired'].mean()
        elif 'final_score' in df.columns:
            # Infer hiring rate from scores (assume score >= 80 means hired)
            overall_hiring_rate = (df['final_score'] >= 80).mean()
        
        # Ensure no NaN values
        if pd.isna(overall_hiring_rate) or not np.isfinite(overall_hiring_rate):
            overall_hiring_rate = 0.0

        insights['summary'] = {
            'total_candidates': len(candidates),
            'overall_bias_score': convert_numpy_types(max_bias_score),
            'overall_hiring_rate': convert_numpy_types(overall_hiring_rate),
            'risk_level': insights['risk_level'],
            'bias_risk_level': insights['risk_level'],  # Add this for frontend compatibility
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        return convert_numpy_types(insights)
    
    def get_ai_insights(self) -> Dict[str, Any]:
        """Get AI performance insights and metrics"""
        
        insights = {
            "ai_status": "active" if self.llm else "limited",
            "langchain_available": LANGCHAIN_AVAILABLE,
            "langfuse_connected": self.langfuse is not None,
            "bias_detection_ready": True,
            "cache_size": len(self.cache),
            "available_features": [
                "bias_detection",
                "text_analysis", 
                "statistical_analysis"
            ]
        }
        
        if self.llm:
            insights["available_features"].extend([
                "ai_bias_analysis",
                "resume_analysis", 
                "interview_questions"
            ])
        
        return insights

# Global instance
ai_orchestrator = None

def get_ai_orchestrator() -> AIOrchestrator:
    """Get global AI orchestrator instance"""
    global ai_orchestrator
    if ai_orchestrator is None:
        ai_orchestrator = AIOrchestrator()
    return ai_orchestrator

def initialize_ai_orchestrator(openai_api_key: str = None, 
                             langfuse_secret_key: Optional[str] = None,
                             langfuse_public_key: Optional[str] = None,
                             langfuse_host: Optional[str] = None):
    """Initialize global AI orchestrator with API keys"""
    global ai_orchestrator
    ai_orchestrator = AIOrchestrator(
        openai_api_key=openai_api_key,
        langfuse_secret_key=langfuse_secret_key,
        langfuse_public_key=langfuse_public_key,
        langfuse_host=langfuse_host
    )
    return ai_orchestrator