import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from typing import Dict, List, Tuple, Any
import joblib
import os

class BiasDetector:
    """ML model for detecting bias in hiring decisions"""
    
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced'
        )
        self.is_trained = False
        self.feature_names = []
        
    def preprocess_data(self, candidates_data: List[Dict[str, Any]]) -> pd.DataFrame:
        """Preprocess candidate data for ML model"""
        df = pd.DataFrame(candidates_data)
        
        # Handle missing values
        numeric_columns = ['experience_years', 'age', 'resume_score', 'interview_score', 'technical_score']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        # Encode categorical variables
        categorical_columns = ['gender', 'ethnicity', 'education_level', 'position_applied']
        for col in categorical_columns:
            if col in df.columns:
                df[col] = pd.Categorical(df[col]).codes
        
        # Create derived features
        if 'skills' in df.columns:
            df['skills_count'] = df['skills'].apply(lambda x: len(x) if isinstance(x, list) else 0)
        
        return df
    
    def calculate_fairness_metrics(self, y_true: np.ndarray, y_pred: np.ndarray, 
                                 protected_attributes: np.ndarray) -> Dict[str, float]:
        """Calculate fairness metrics"""
        metrics = {}
        
        # Demographic Parity
        overall_positive_rate = np.mean(y_pred)
        group_positive_rates = []
        
        for group in np.unique(protected_attributes):
            group_mask = protected_attributes == group
            if np.sum(group_mask) > 0:
                group_rate = np.mean(y_pred[group_mask])
                group_positive_rates.append(group_rate)
        
        if group_positive_rates:
            metrics['demographic_parity'] = 1 - (max(group_positive_rates) - min(group_positive_rates))
        else:
            metrics['demographic_parity'] = 1.0
        
        # Equalized Odds
        true_positive_rates = []
        false_positive_rates = []
        
        for group in np.unique(protected_attributes):
            group_mask = protected_attributes == group
            if np.sum(group_mask) > 0:
                group_y_true = y_true[group_mask]
                group_y_pred = y_pred[group_mask]
                
                if np.sum(group_y_true) > 0:
                    tpr = np.sum((group_y_true == 1) & (group_y_pred == 1)) / np.sum(group_y_true == 1)
                    true_positive_rates.append(tpr)
                
                if np.sum(group_y_true == 0) > 0:
                    fpr = np.sum((group_y_true == 0) & (group_y_pred == 1)) / np.sum(group_y_true == 0)
                    false_positive_rates.append(fpr)
        
        if true_positive_rates:
            metrics['equalized_odds_tpr'] = 1 - (max(true_positive_rates) - min(true_positive_rates))
        else:
            metrics['equalized_odds_tpr'] = 1.0
            
        if false_positive_rates:
            metrics['equalized_odds_fpr'] = 1 - (max(false_positive_rates) - min(false_positive_rates))
        else:
            metrics['equalized_odds_fpr'] = 1.0
        
        metrics['equalized_odds'] = (metrics['equalized_odds_tpr'] + metrics['equalized_odds_fpr']) / 2
        
        # Statistical Parity
        metrics['statistical_parity'] = metrics['demographic_parity']
        
        return metrics
    
    def detect_bias(self, candidates_data: List[Dict[str, Any]], 
                   protected_attribute: str = 'gender') -> Dict[str, Any]:
        """Detect bias in hiring decisions"""
        df = self.preprocess_data(candidates_data)
        
        if len(df) < 10:
            return {
                'bias_score': 0.0,
                'fairness_metrics': {},
                'recommendations': ['Insufficient data for bias analysis'],
                'flagged_candidates': []
            }
        
        # Prepare features and target
        feature_columns = ['experience_years', 'age', 'resume_score', 'interview_score', 'technical_score']
        feature_columns = [col for col in feature_columns if col in df.columns]
        
        if not feature_columns:
            return {
                'bias_score': 0.0,
                'fairness_metrics': {},
                'recommendations': ['Insufficient features for bias analysis'],
                'flagged_candidates': []
            }
        
        X = df[feature_columns].fillna(0)
        
        # Use hiring decision as target (1 = hired, 0 = not hired)
        if 'hiring_decision' in df.columns:
            y = (df['hiring_decision'] == 'hired').astype(int)
        else:
            # Use final score threshold as proxy
            if 'final_score' in df.columns:
                y = (df['final_score'] >= 70).astype(int)
            else:
                return {
                    'bias_score': 0.0,
                    'fairness_metrics': {},
                    'recommendations': ['No hiring decisions available for analysis'],
                    'flagged_candidates': []
                }
        
        # Get protected attribute values
        if protected_attribute in df.columns:
            protected_values = df[protected_attribute].values
        else:
            protected_values = np.zeros(len(df))
        
        # Calculate fairness metrics
        y_pred = y.values  # Use actual decisions as predictions for fairness calculation
        fairness_metrics = self.calculate_fairness_metrics(y.values, y_pred, protected_values)
        
        # Calculate overall bias score (inverse of average fairness)
        avg_fairness = np.mean(list(fairness_metrics.values()))
        bias_score = 1 - avg_fairness
        
        # Generate recommendations
        recommendations = []
        if fairness_metrics.get('demographic_parity', 1) < 0.8:
            recommendations.append("Consider reviewing selection criteria for demographic fairness")
        if fairness_metrics.get('equalized_odds', 1) < 0.8:
            recommendations.append("Review decision consistency across demographic groups")
        if bias_score > 0.3:
            recommendations.append("High bias detected - recommend manual review of recent decisions")
        
        # Flag potentially biased decisions
        flagged_candidates = []
        if 'id' in df.columns and bias_score > 0.5:
            # Flag candidates from underrepresented groups with low scores
            for idx, row in df.iterrows():
                if row.get('final_score', 0) < 50 and row.get(protected_attribute, 0) != 0:
                    flagged_candidates.append(int(row['id']))
        
        return {
            'bias_score': float(bias_score),
            'fairness_metrics': fairness_metrics,
            'recommendations': recommendations,
            'flagged_candidates': flagged_candidates
        }
    
    def train_model(self, training_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Train the bias detection model"""
        df = self.preprocess_data(training_data)
        
        if len(df) < 50:
            raise ValueError("Insufficient training data (minimum 50 samples required)")
        
        # Prepare features
        feature_columns = ['experience_years', 'age', 'resume_score', 'interview_score', 'technical_score']
        feature_columns = [col for col in feature_columns if col in df.columns]
        
        X = df[feature_columns].fillna(0)
        
        # Target: hiring decision
        if 'hiring_decision' in df.columns:
            y = (df['hiring_decision'] == 'hired').astype(int)
        else:
            y = (df['final_score'] >= 70).astype(int)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        self.feature_names = feature_columns
        self.is_trained = True
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted')
        }
        
        return metrics
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        model_data = joblib.load(filepath)
        self.model = model_data['model']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
