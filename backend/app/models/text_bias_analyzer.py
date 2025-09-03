"""
Advanced Text Bias Analysis using Machine Learning and Natural Language Processing
"""

import re
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod
import warnings
warnings.filterwarnings('ignore')

# Try to import advanced NLP libraries with fallbacks
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False

try:
    import spacy
    try:
        nlp = spacy.load("en_core_web_sm")
        SPACY_AVAILABLE = True
    except OSError:
        SPACY_AVAILABLE = False
except ImportError:
    SPACY_AVAILABLE = False

@dataclass
class BiasDetectionResult:
    """Results from bias detection analysis"""
    bias_detected: bool
    bias_score: float
    confidence: float
    detected_patterns: Dict[str, List[str]]
    sentiment_analysis: Dict[str, float]
    linguistic_analysis: Dict[str, Any]
    risk_level: str
    recommendations: List[str]
    detailed_analysis: Dict[str, Any]

class BiasAnalyzer(ABC):
    """Abstract base class for bias analyzers"""
    
    @abstractmethod
    def analyze(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        pass

class RuleBiasAnalyzer(BiasAnalyzer):
    """Rule-based bias detection using pattern matching"""
    
    def __init__(self):
        self.bias_patterns = {
            'age_bias': {
                'patterns': [
                    'young', 'old', 'mature', 'experienced', 'fresh', 'energetic',
                    'digital native', 'generation', 'too old', 'too young', 'millennial',
                    'boomer', 'gen z', 'seasoned', 'veteran', 'junior', 'senior',
                    'entry-level', 'new graduate', 'recent grad'
                ],
                'weight': 1.2
            },
            'gender_bias': {
                'patterns': [
                    'aggressive', 'assertive', 'emotional', 'nurturing', 'bossy',
                    'hysterical', 'dramatic', 'soft', 'pushy', 'nice', 'sweet',
                    'motherly', 'fatherly', 'manly', 'feminine', 'masculine',
                    'strong-willed', 'delicate', 'tough', 'gentle', 'caring'
                ],
                'weight': 1.5
            },
            'appearance_bias': {
                'patterns': [
                    'attractive', 'professional appearance', 'well-groomed', 'presentable',
                    'polished', 'neat', 'dress', 'looks', 'appearance', 'style',
                    'fashionable', 'sophisticated', 'elegant', 'beautiful', 'handsome'
                ],
                'weight': 1.3
            },
            'cultural_bias': {
                'patterns': [
                    'cultural fit', 'team fit', 'our type', 'background', 'foreign',
                    'accent', 'communication style', 'different', 'diverse',
                    'exotic', 'ethnic', 'traditional', 'westernized', 'americanized'
                ],
                'weight': 1.4
            },
            'family_bias': {
                'patterns': [
                    'family', 'children', 'pregnant', 'maternity', 'paternity',
                    'childcare', 'availability', 'commitment', 'flexible schedule',
                    'work-life balance', 'personal obligations', 'travel requirements'
                ],
                'weight': 1.6
            },
            'socioeconomic_bias': {
                'patterns': [
                    'expensive education', 'ivy league', 'prestigious', 'elite',
                    'upper class', 'privileged', 'disadvantaged', 'network',
                    'connections', 'social status', 'well-connected'
                ],
                'weight': 1.2
            },
            'disability_bias': {
                'patterns': [
                    'disabled', 'handicapped', 'accommodation', 'limitation',
                    'special needs', 'medical condition', 'physical ability',
                    'mental health', 'psychiatric', 'therapy'
                ],
                'weight': 1.7
            }
        }
        
        # Context-aware patterns (stronger indicators in certain contexts)
        self.contextual_patterns = {
            'negative_context': [
                'not sure if', 'concerned about', 'worried that', 'might be',
                'could be problematic', 'red flag', 'concerning'
            ],
            'positive_context': [
                'excellent', 'outstanding', 'impressive', 'strong candidate',
                'highly qualified', 'perfect fit'
            ]
        }
    
    def analyze(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze text for bias using rule-based approach"""
        text_lower = text.lower()
        detected_patterns = {}
        bias_scores = {}
        total_bias_score = 0.0
        
        # Pattern detection with weighted scoring
        for bias_type, config in self.bias_patterns.items():
            found_patterns = []
            type_score = 0.0
            
            for pattern in config['patterns']:
                if pattern in text_lower:
                    found_patterns.append(pattern)
                    # Context-aware scoring
                    context_multiplier = self._get_context_multiplier(text_lower, pattern)
                    type_score += config['weight'] * context_multiplier
            
            if found_patterns:
                detected_patterns[bias_type] = found_patterns
                bias_scores[bias_type] = min(1.0, type_score * 0.1)
                total_bias_score += bias_scores[bias_type]
        
        # Normalize total score
        total_bias_score = min(1.0, total_bias_score * 0.2)
        
        # Enhanced bias detection logic
        bias_detected = (
            total_bias_score > 0.3 or 
            len(detected_patterns) > 2 or
            any(score > 0.5 for score in bias_scores.values())
        )
        
        return {
            'method': 'rule_based',
            'bias_detected': bias_detected,
            'bias_score': total_bias_score,
            'detected_patterns': detected_patterns,
            'pattern_scores': bias_scores,
            'confidence': min(0.9, 0.5 + len(detected_patterns) * 0.1)
        }
    
    def _get_context_multiplier(self, text: str, pattern: str) -> float:
        """Analyze context around pattern for enhanced scoring"""
        pattern_index = text.find(pattern)
        if pattern_index == -1:
            return 1.0
        
        # Get surrounding context (50 characters before and after)
        start = max(0, pattern_index - 50)
        end = min(len(text), pattern_index + len(pattern) + 50)
        context = text[start:end]
        
        # Check for negative context
        for neg_pattern in self.contextual_patterns['negative_context']:
            if neg_pattern in context:
                return 1.5  # Increase weight for negative context
        
        # Check for positive context
        for pos_pattern in self.contextual_patterns['positive_context']:
            if pos_pattern in context:
                return 0.7  # Decrease weight for positive context
        
        return 1.0

class SentimentBiasAnalyzer(BiasAnalyzer):
    """Sentiment-based bias detection"""
    
    def __init__(self):
        self.sentiment_analyzer = None
        if TEXTBLOB_AVAILABLE:
            self.method = 'textblob'
        else:
            self.method = 'basic'
    
    def analyze(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment patterns that might indicate bias"""
        
        if self.method == 'textblob':
            return self._textblob_analysis(text, candidate_info)
        else:
            return self._basic_sentiment_analysis(text, candidate_info)
    
    def _textblob_analysis(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Use TextBlob for sentiment analysis"""
        blob = TextBlob(text)
        
        sentiment_score = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        # Analyze sentence-level sentiment
        sentences = blob.sentences
        sentence_sentiments = [s.sentiment.polarity for s in sentences]
        
        # Look for sentiment inconsistencies that might indicate bias
        sentiment_variance = np.var(sentence_sentiments) if sentence_sentiments else 0
        
        # Bias indicators based on sentiment patterns
        bias_indicators = []
        if sentiment_variance > 0.5:
            bias_indicators.append("High sentiment variance detected")
        
        if subjectivity > 0.7:
            bias_indicators.append("Highly subjective language detected")
        
        if sentiment_score < -0.3:
            bias_indicators.append("Predominantly negative sentiment")
        
        bias_score = min(1.0, (sentiment_variance + subjectivity) * 0.5)
        
        return {
            'method': 'sentiment_textblob',
            'sentiment_score': sentiment_score,
            'subjectivity': subjectivity,
            'sentiment_variance': sentiment_variance,
            'bias_indicators': bias_indicators,
            'bias_score': bias_score,
            'bias_detected': bias_score > 0.4
        }
    
    def _basic_sentiment_analysis(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Basic sentiment analysis using word lists"""
        positive_words = ['excellent', 'outstanding', 'impressive', 'strong', 'qualified', 'perfect']
        negative_words = ['poor', 'weak', 'concerning', 'problematic', 'insufficient', 'lacking']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        total_words = len(text_lower.split())
        sentiment_score = (pos_count - neg_count) / max(total_words, 1)
        
        return {
            'method': 'sentiment_basic',
            'positive_words': pos_count,
            'negative_words': neg_count,
            'sentiment_score': sentiment_score,
            'bias_score': abs(sentiment_score) if abs(sentiment_score) > 0.1 else 0,
            'bias_detected': abs(sentiment_score) > 0.2
        }

class LinguisticBiasAnalyzer(BiasAnalyzer):
    """Linguistic analysis for bias detection"""
    
    def __init__(self):
        self.spacy_available = SPACY_AVAILABLE
    
    def analyze(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze linguistic features that might indicate bias"""
        
        if self.spacy_available:
            return self._spacy_analysis(text, candidate_info)
        else:
            return self._basic_linguistic_analysis(text, candidate_info)
    
    def _spacy_analysis(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Use spaCy for advanced linguistic analysis"""
        doc = nlp(text)
        
        # Extract linguistic features
        features = {
            'entity_count': len(doc.ents),
            'adjective_count': len([token for token in doc if token.pos_ == 'ADJ']),
            'subjective_words': len([token for token in doc if token.pos_ in ['ADV', 'ADJ']]),
            'sentence_count': len(list(doc.sents)),
            'avg_sentence_length': np.mean([len(sent.text.split()) for sent in doc.sents]),
            'personal_pronouns': len([token for token in doc if token.tag_ in ['PRP', 'PRP$']])
        }
        
        # Bias indicators based on linguistic patterns
        bias_score = 0.0
        indicators = []
        
        # High adjective usage might indicate subjective evaluation
        adj_ratio = features['adjective_count'] / max(len(doc), 1)
        if adj_ratio > 0.15:
            bias_score += 0.2
            indicators.append("High adjective usage detected")
        
        # Personal pronouns usage
        pronoun_ratio = features['personal_pronouns'] / max(len(doc), 1)
        if pronoun_ratio > 0.1:
            bias_score += 0.15
            indicators.append("Frequent personal pronoun usage")
        
        return {
            'method': 'linguistic_spacy',
            'features': features,
            'bias_indicators': indicators,
            'bias_score': min(1.0, bias_score),
            'bias_detected': bias_score > 0.3
        }
    
    def _basic_linguistic_analysis(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Basic linguistic analysis without advanced NLP"""
        words = text.split()
        sentences = text.split('.')
        
        # Simple feature extraction
        features = {
            'word_count': len(words),
            'sentence_count': len(sentences),
            'avg_word_length': np.mean([len(word) for word in words]) if words else 0,
            'punctuation_count': len([c for c in text if c in '!?.,;:'])
        }
        
        # Basic bias indicators
        exclamation_count = text.count('!')
        question_count = text.count('?')
        
        bias_score = 0.0
        indicators = []
        
        if exclamation_count > 2:
            bias_score += 0.2
            indicators.append("Excessive exclamation marks")
        
        if features['avg_word_length'] < 4:
            bias_score += 0.1
            indicators.append("Unusually simple language")
        
        return {
            'method': 'linguistic_basic',
            'features': features,
            'bias_indicators': indicators,
            'bias_score': bias_score,
            'bias_detected': bias_score > 0.2
        }

class MLBiasAnalyzer(BiasAnalyzer):
    """Machine Learning-based bias detection using transformers"""
    
    def __init__(self):
        self.model_available = TRANSFORMERS_AVAILABLE
        self.classifier = None
        
        if self.model_available:
            try:
                # Use a general sentiment classifier as a proxy for bias detection
                self.classifier = pipeline(
                    "sentiment-analysis",
                    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                    return_all_scores=True
                )
            except Exception:
                self.model_available = False
    
    def analyze(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Use ML model for bias detection"""
        
        if not self.model_available or not self.classifier:
            return self._fallback_analysis(text, candidate_info)
        
        try:
            # Analyze overall sentiment
            results = self.classifier(text)
            
            # Extract features from transformer output
            sentiment_scores = {result['label']: result['score'] for result in results[0]}
            
            # Calculate bias indicators from sentiment distribution
            score_variance = np.var(list(sentiment_scores.values()))
            negative_score = sentiment_scores.get('LABEL_0', sentiment_scores.get('negative', 0))
            
            # Bias detection based on sentiment patterns
            bias_score = min(1.0, score_variance + negative_score * 0.5)
            bias_detected = bias_score > 0.4 or negative_score > 0.6
            
            return {
                'method': 'ml_transformer',
                'sentiment_scores': sentiment_scores,
                'score_variance': score_variance,
                'bias_score': bias_score,
                'bias_detected': bias_detected,
                'confidence': 0.8
            }
            
        except Exception as e:
            return self._fallback_analysis(text, candidate_info)
    
    def _fallback_analysis(self, text: str, candidate_info: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis when ML models are not available"""
        return {
            'method': 'ml_fallback',
            'bias_score': 0.0,
            'bias_detected': False,
            'confidence': 0.3,
            'note': 'ML models not available, using fallback'
        }

class AdvancedTextBiasAnalyzer:
    """Advanced Text Bias Analyzer combining multiple ML and NLP techniques"""
    
    def __init__(self):
        self.analyzers = {
            'rule_based': RuleBiasAnalyzer(),
            'sentiment': SentimentBiasAnalyzer(),
            'linguistic': LinguisticBiasAnalyzer(),
            'ml_model': MLBiasAnalyzer()
        }
        
        # Weights for combining different analyzer results
        self.analyzer_weights = {
            'rule_based': 0.4,
            'sentiment': 0.2,
            'linguistic': 0.2,
            'ml_model': 0.2
        }
    
    def analyze_comprehensive(self, text: str, candidate_info: Dict[str, Any] = None) -> BiasDetectionResult:
        """Perform comprehensive bias analysis using multiple methods"""
        
        if candidate_info is None:
            candidate_info = {}
        
        # Run all analyzers
        analyzer_results = {}
        for name, analyzer in self.analyzers.items():
            try:
                result = analyzer.analyze(text, candidate_info)
                analyzer_results[name] = result
            except Exception as e:
                analyzer_results[name] = {
                    'method': name,
                    'error': str(e),
                    'bias_score': 0.0,
                    'bias_detected': False
                }
        
        # Combine results
        combined_result = self._combine_results(analyzer_results, text, candidate_info)
        
        return BiasDetectionResult(**combined_result)
    
    def _combine_results(self, analyzer_results: Dict[str, Dict], text: str, candidate_info: Dict) -> Dict[str, Any]:
        """Combine results from multiple analyzers"""
        
        # Calculate weighted bias score
        total_bias_score = 0.0
        total_weight = 0.0
        bias_detected_count = 0
        all_detected_patterns = {}
        all_recommendations = set()
        
        for analyzer_name, result in analyzer_results.items():
            if 'error' not in result:
                weight = self.analyzer_weights.get(analyzer_name, 0.1)
                bias_score = result.get('bias_score', 0.0)
                total_bias_score += bias_score * weight
                total_weight += weight
                
                if result.get('bias_detected', False):
                    bias_detected_count += 1
                
                # Collect detected patterns
                patterns = result.get('detected_patterns', {})
                for pattern_type, pattern_list in patterns.items():
                    if pattern_type not in all_detected_patterns:
                        all_detected_patterns[pattern_type] = []
                    all_detected_patterns[pattern_type].extend(pattern_list)
        
        # Normalize bias score
        final_bias_score = total_bias_score / max(total_weight, 1.0)
        
        # Determine if bias is detected (consensus approach)
        bias_detected = (
            bias_detected_count >= 2 or 
            final_bias_score > 0.4 or
            len(all_detected_patterns) > 3
        )
        
        # Calculate confidence based on agreement between analyzers
        confidence = min(0.95, 0.5 + (bias_detected_count / len(self.analyzers)) * 0.5)
        
        # Determine risk level
        risk_level = self._calculate_risk_level(final_bias_score, len(all_detected_patterns))
        
        # Generate recommendations
        recommendations = self._generate_recommendations(all_detected_patterns, final_bias_score)
        
        # Extract sentiment and linguistic analysis
        sentiment_analysis = self._extract_sentiment_analysis(analyzer_results)
        linguistic_analysis = self._extract_linguistic_analysis(analyzer_results)
        
        return {
            'bias_detected': bias_detected,
            'bias_score': final_bias_score,
            'confidence': confidence,
            'detected_patterns': all_detected_patterns,
            'sentiment_analysis': sentiment_analysis,
            'linguistic_analysis': linguistic_analysis,
            'risk_level': risk_level,
            'recommendations': recommendations,
            'detailed_analysis': analyzer_results
        }
    
    def _calculate_risk_level(self, bias_score: float, pattern_count: int) -> str:
        """Calculate risk level based on bias score and detected patterns"""
        if bias_score > 0.7 or pattern_count > 5:
            return 'high'
        elif bias_score > 0.4 or pattern_count > 2:
            return 'medium'
        elif bias_score > 0.2 or pattern_count > 0:
            return 'low'
        else:
            return 'minimal'
    
    def _generate_recommendations(self, detected_patterns: Dict[str, List], bias_score: float) -> List[str]:
        """Generate actionable recommendations based on analysis"""
        recommendations = []
        
        if bias_score > 0.6:
            recommendations.append("🚨 High bias risk - Recommend immediate review and revision")
        
        for pattern_type in detected_patterns:
            if pattern_type == 'age_bias':
                recommendations.append("Remove age-related descriptors and focus on relevant experience")
            elif pattern_type == 'gender_bias':
                recommendations.append("Use gender-neutral language and avoid stereotypical descriptors")
            elif pattern_type == 'appearance_bias':
                recommendations.append("Focus on job-relevant skills rather than physical appearance")
            elif pattern_type == 'cultural_bias':
                recommendations.append("Evaluate based on qualifications, not cultural background or 'fit'")
            elif pattern_type == 'family_bias':
                recommendations.append("Avoid references to family status or personal life circumstances")
            elif pattern_type == 'socioeconomic_bias':
                recommendations.append("Focus on skills and achievements rather than background or connections")
            elif pattern_type == 'disability_bias':
                recommendations.append("Ensure evaluations are based on ability to perform job functions")
        
        if not detected_patterns:
            recommendations.append("✅ Text appears to be free of obvious bias indicators")
        
        # General recommendations
        recommendations.extend([
            "Use structured evaluation criteria",
            "Consider blind review processes where possible",
            "Train evaluators on unconscious bias recognition"
        ])
        
        return list(set(recommendations))  # Remove duplicates
    
    def _extract_sentiment_analysis(self, analyzer_results: Dict) -> Dict[str, float]:
        """Extract sentiment analysis from analyzer results"""
        sentiment_data = {}
        
        if 'sentiment' in analyzer_results:
            sentiment_result = analyzer_results['sentiment']
            sentiment_data.update({
                'sentiment_score': sentiment_result.get('sentiment_score', 0.0),
                'subjectivity': sentiment_result.get('subjectivity', 0.0)
            })
        
        if 'ml_model' in analyzer_results:
            ml_result = analyzer_results['ml_model']
            if 'sentiment_scores' in ml_result:
                sentiment_data.update(ml_result['sentiment_scores'])
        
        return sentiment_data
    
    def _extract_linguistic_analysis(self, analyzer_results: Dict) -> Dict[str, Any]:
        """Extract linguistic analysis from analyzer results"""
        if 'linguistic' in analyzer_results:
            return analyzer_results['linguistic'].get('features', {})
        return {}

# Utility functions for integration
def analyze_text_bias(text: str, candidate_info: Dict[str, Any] = None) -> Dict[str, Any]:
    """Main function for text bias analysis - can be called from other modules"""
    analyzer = AdvancedTextBiasAnalyzer()
    result = analyzer.analyze_comprehensive(text, candidate_info)
    
    # Convert BiasDetectionResult to dictionary for JSON serialization
    return {
        'bias_detected': result.bias_detected,
        'bias_score': result.bias_score,
        'confidence': result.confidence,
        'detected_patterns': result.detected_patterns,
        'sentiment_analysis': result.sentiment_analysis,
        'linguistic_analysis': result.linguistic_analysis,
        'risk_level': result.risk_level,
        'recommendations': result.recommendations,
        'detailed_analysis': result.detailed_analysis
    }

def get_bias_analyzer_info() -> Dict[str, Any]:
    """Get information about available analyzers and dependencies"""
    return {
        'transformers_available': TRANSFORMERS_AVAILABLE,
        'textblob_available': TEXTBLOB_AVAILABLE,
        'spacy_available': SPACY_AVAILABLE,
        'analyzers': [
            'rule_based',
            'sentiment',
            'linguistic',
            'ml_model'
        ]
    }
