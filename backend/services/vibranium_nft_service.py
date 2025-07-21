"""
Vibranium NFT Service - Blockchain-Powered Cosmic Economy

This service provides NFT integration for the VIBE token economy:
- NFT marketplace for code artifacts
- Blockchain integration for VIBE tokens  
- Smart contracts for code ownership
- Cosmic NFT generation from code patterns
- Interdimensional trading mechanisms
"""

import asyncio
import uuid
import json
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import random
import math

logger = logging.getLogger(__name__)

class VibraniumNFTService:
    """
    Advanced blockchain service for cosmic code economy and NFT generation
    """
    
    def __init__(self, db_manager):
        self.db_manager = db_manager
        self.db = db_manager.db
        self.blockchain_networks = {
            'cosmic_chain': {
                'name': 'Cosmic Chain',
                'chain_id': 777,
                'native_token': 'COSMIC',
                'gas_fee': 0.001,
                'confirmation_time': 3
            },
            'ethereum': {
                'name': 'Ethereum Mainnet',
                'chain_id': 1, 
                'native_token': 'ETH',
                'gas_fee': 0.02,
                'confirmation_time': 60
            },
            'polygon': {
                'name': 'Polygon Network',
                'chain_id': 137,
                'native_token': 'MATIC',
                'gas_fee': 0.0001,
                'confirmation_time': 5
            }
        }
        
        # NFT rarity tiers based on code quality
        self.rarity_tiers = {
            'common': {'multiplier': 1.0, 'color': '#8B8B8B', 'glow': 'none'},
            'uncommon': {'multiplier': 1.5, 'color': '#4CAF50', 'glow': 'soft'},
            'rare': {'multiplier': 2.5, 'color': '#2196F3', 'glow': 'medium'},
            'epic': {'multiplier': 4.0, 'color': '#9C27B0', 'glow': 'strong'},
            'legendary': {'multiplier': 7.0, 'color': '#FF9800', 'glow': 'intense'},
            'cosmic': {'multiplier': 12.0, 'color': '#E91E63', 'glow': 'transcendent'}
        }
        
        logger.info("💎 Vibranium NFT Service initialized - Cosmic blockchain economy online!")

    async def mint_code_nft(
        self, 
        user_id: str, 
        code: str, 
        title: str, 
        description: str = '',
        network: str = 'cosmic_chain'
    ) -> Dict[str, Any]:
        """
        Mint an NFT from code using cosmic algorithms
        """
        try:
            logger.info(f"⚒️ Minting code NFT for user {user_id}")
            
            # Analyze code for NFT properties
            code_analysis = await self._analyze_code_for_nft(code)
            
            # Generate cosmic metadata
            nft_metadata = await self._generate_nft_metadata(
                code, title, description, code_analysis
            )
            
            # Determine rarity tier
            rarity = self._calculate_rarity_tier(code_analysis)
            
            # Generate unique token ID
            token_id = self._generate_token_id(user_id, code, title)
            
            # Create blockchain transaction
            transaction = await self._create_mint_transaction(
                user_id, token_id, nft_metadata, network, rarity
            )
            
            # Generate visual representation
            visual_data = await self._generate_nft_visual(code, code_analysis, rarity)
            
            # Save NFT record
            nft_record = {
                'nft_id': str(uuid.uuid4()),
                'token_id': token_id,
                'owner_id': user_id,
                'title': title,
                'description': description,
                'code': code,
                'metadata': nft_metadata,
                'rarity': rarity,
                'network': network,
                'transaction': transaction,
                'visual_data': visual_data,
                'minted_at': datetime.utcnow(),
                'status': 'minted'
            }
            
            await self.db.nft_collection.insert_one(nft_record.copy())
            
            return {
                'success': True,
                'nft_id': nft_record['nft_id'],
                'token_id': token_id,
                'rarity': rarity,
                'metadata': nft_metadata,
                'transaction_hash': transaction['hash'],
                'network': network,
                'visual_data': visual_data,
                'opensea_url': f'https://opensea.io/assets/{network}/{token_id}',
                'marketplace_value': self._estimate_marketplace_value(rarity, code_analysis),
                'message': f'Cosmic NFT minted! Rarity: {rarity.upper()}'
            }
            
        except Exception as e:
            logger.error(f"NFT minting failed: {e}")
            return {'success': False, 'error': str(e)}

    async def _analyze_code_for_nft(self, code: str) -> Dict[str, Any]:
        """Analyze code to determine NFT properties"""
        
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        analysis = {
            'total_lines': len(lines),
            'code_lines': len(non_empty_lines),
            'complexity_score': 0,
            'creativity_score': 0,
            'efficiency_score': 0,
            'uniqueness_score': 0,
            'patterns_detected': [],
            'language_features': []
        }
        
        # Calculate complexity
        complexity_factors = {
            'functions': code.count('function') + code.count('def '),
            'classes': code.count('class '),
            'loops': code.count('for ') + code.count('while '),
            'conditions': code.count('if ') + code.count('else'),
            'async_patterns': code.count('async ') + code.count('await ')
        }
        
        analysis['complexity_score'] = min(1.0, sum(complexity_factors.values()) / max(1, len(non_empty_lines)))
        
        # Calculate creativity
        creative_patterns = [
            'recursive', 'fibonacci', 'fractal', 'quantum', 'neural',
            'cosmic', 'magic', 'elegant', 'beautiful', 'artistic'
        ]
        creativity_matches = sum(1 for pattern in creative_patterns if pattern.lower() in code.lower())
        analysis['creativity_score'] = min(1.0, creativity_matches / 10)
        
        # Calculate efficiency (fewer lines for same functionality = higher efficiency)
        analysis['efficiency_score'] = max(0.1, 1.0 - (len(non_empty_lines) / 100))
        
        # Calculate uniqueness using hash entropy
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        hash_entropy = len(set(code_hash)) / 16  # 16 possible hex chars
        analysis['uniqueness_score'] = hash_entropy
        
        # Detect special patterns
        if 'algorithm' in code.lower():
            analysis['patterns_detected'].append('algorithmic')
        if 'ai' in code.lower() or 'ml' in code.lower():
            analysis['patterns_detected'].append('artificial_intelligence')
        if 'crypto' in code.lower() or 'blockchain' in code.lower():
            analysis['patterns_detected'].append('blockchain')
        if 'quantum' in code.lower():
            analysis['patterns_detected'].append('quantum_computing')
        
        return analysis

    async def _generate_nft_metadata(
        self, 
        code: str, 
        title: str, 
        description: str, 
        analysis: Dict
    ) -> Dict[str, Any]:
        """Generate comprehensive NFT metadata"""
        
        # Calculate overall quality score
        quality_score = (
            analysis['complexity_score'] * 0.3 +
            analysis['creativity_score'] * 0.3 + 
            analysis['efficiency_score'] * 0.2 +
            analysis['uniqueness_score'] * 0.2
        )
        
        metadata = {
            'name': title,
            'description': description or f'Cosmic code artifact: {title}',
            'image': '',  # Will be generated
            'attributes': [
                {'trait_type': 'Lines of Code', 'value': analysis['code_lines']},
                {'trait_type': 'Complexity', 'value': round(analysis['complexity_score'] * 100)},
                {'trait_type': 'Creativity', 'value': round(analysis['creativity_score'] * 100)},
                {'trait_type': 'Efficiency', 'value': round(analysis['efficiency_score'] * 100)},
                {'trait_type': 'Uniqueness', 'value': round(analysis['uniqueness_score'] * 100)},
                {'trait_type': 'Quality Score', 'value': round(quality_score * 100)},
                {'trait_type': 'Cosmic Signature', 'value': self._generate_cosmic_signature(code)}
            ],
            'properties': {
                'code_hash': hashlib.sha256(code.encode()).hexdigest(),
                'patterns': analysis['patterns_detected'],
                'generated_at': datetime.utcnow().isoformat(),
                'cosmic_coordinates': self._generate_cosmic_coordinates(),
                'vibrational_frequency': self._calculate_vibrational_frequency(code)
            }
        }
        
        return metadata

    def _calculate_rarity_tier(self, analysis: Dict) -> str:
        """Calculate NFT rarity tier based on code analysis"""
        
        quality_score = (
            analysis['complexity_score'] * 0.3 +
            analysis['creativity_score'] * 0.3 + 
            analysis['efficiency_score'] * 0.2 +
            analysis['uniqueness_score'] * 0.2
        )
        
        # Special patterns boost rarity
        pattern_boost = len(analysis['patterns_detected']) * 0.1
        total_score = quality_score + pattern_boost
        
        if total_score >= 0.9:
            return 'cosmic'
        elif total_score >= 0.75:
            return 'legendary'
        elif total_score >= 0.6:
            return 'epic'
        elif total_score >= 0.45:
            return 'rare'
        elif total_score >= 0.3:
            return 'uncommon'
        else:
            return 'common'

    def _generate_token_id(self, user_id: str, code: str, title: str) -> str:
        """Generate unique token ID"""
        combined = f"{user_id}_{code}_{title}_{datetime.utcnow().isoformat()}"
        token_hash = hashlib.sha256(combined.encode()).hexdigest()
        return int(token_hash[:16], 16)  # Convert to integer for ERC-721 compatibility

    async def _create_mint_transaction(
        self, 
        user_id: str, 
        token_id: str, 
        metadata: Dict, 
        network: str,
        rarity: str
    ) -> Dict[str, Any]:
        """Create blockchain minting transaction"""
        
        network_config = self.blockchain_networks.get(network, self.blockchain_networks['cosmic_chain'])
        
        # Simulate transaction creation
        transaction = {
            'hash': hashlib.sha256(f"{user_id}_{token_id}_{datetime.utcnow()}".encode()).hexdigest(),
            'from': user_id,
            'to': 'NFT_CONTRACT_ADDRESS',
            'value': '0',
            'gas_used': random.randint(50000, 150000),
            'gas_price': network_config['gas_fee'],
            'network': network,
            'status': 'confirmed',
            'block_number': random.randint(15000000, 20000000),
            'timestamp': datetime.utcnow(),
            'metadata_uri': f'ipfs://cosmic-metadata/{token_id}',
            'contract_address': f'0x{hashlib.md5(network.encode()).hexdigest()[:40]}'
        }
        
        return transaction

    async def _generate_nft_visual(self, code: str, analysis: Dict, rarity: str) -> Dict[str, Any]:
        """Generate visual representation of the NFT"""
        
        rarity_config = self.rarity_tiers[rarity]
        
        # Generate code-based visual patterns
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        
        visual = {
            'background_pattern': self._generate_background_pattern(code_hash, rarity),
            'code_visualization': self._generate_code_visualization(code, analysis),
            'rarity_effects': {
                'glow_type': rarity_config['glow'],
                'color_scheme': rarity_config['color'],
                'particle_effects': rarity == 'cosmic',
                'holographic': rarity in ['legendary', 'cosmic'],
                'animated': rarity in ['epic', 'legendary', 'cosmic']
            },
            'sacred_geometry': self._generate_sacred_geometry(code_hash),
            'dimensions': {'width': 512, 'height': 512}
        }
        
        return visual

    def _generate_background_pattern(self, code_hash: str, rarity: str) -> Dict[str, Any]:
        """Generate background pattern based on code hash"""
        
        # Use hash to determine pattern characteristics
        pattern_seed = int(code_hash[:8], 16)
        
        patterns = ['mandala', 'fractal', 'geometric', 'organic', 'digital', 'cosmic']
        pattern_type = patterns[pattern_seed % len(patterns)]
        
        return {
            'type': pattern_type,
            'seed': pattern_seed,
            'complexity': self.rarity_tiers[rarity]['multiplier'] / 12.0,
            'color_scheme': self.rarity_tiers[rarity]['color']
        }

    def _generate_code_visualization(self, code: str, analysis: Dict) -> Dict[str, Any]:
        """Generate visual representation of code structure"""
        
        lines = code.split('\n')
        visualization = {
            'structure_map': [],
            'syntax_colors': {},
            'flow_patterns': []
        }
        
        for i, line in enumerate(lines):
            line_data = {
                'line_number': i + 1,
                'indent_level': len(line) - len(line.lstrip()),
                'line_type': self._classify_line_type(line),
                'importance': self._calculate_line_importance(line)
            }
            visualization['structure_map'].append(line_data)
        
        return visualization

    def _classify_line_type(self, line: str) -> str:
        """Classify type of code line"""
        line = line.strip()
        if not line or line.startswith('//') or line.startswith('#'):
            return 'comment'
        elif 'function' in line or 'def ' in line:
            return 'function_declaration'
        elif 'class ' in line:
            return 'class_declaration'
        elif 'if ' in line or 'else' in line:
            return 'conditional'
        elif 'for ' in line or 'while ' in line:
            return 'loop'
        elif 'return ' in line:
            return 'return_statement'
        else:
            return 'statement'

    def _calculate_line_importance(self, line: str) -> float:
        """Calculate importance of a line for visualization"""
        importance = 0.1  # Base importance
        
        if 'function' in line or 'def ' in line:
            importance += 0.8
        elif 'class ' in line:
            importance += 0.9
        elif 'if ' in line or 'else' in line:
            importance += 0.4
        elif 'return ' in line:
            importance += 0.3
        
        return min(1.0, importance)

    def _generate_sacred_geometry(self, code_hash: str) -> Dict[str, Any]:
        """Generate sacred geometry overlay based on code"""
        
        geometry_seed = int(code_hash[8:16], 16)
        
        geometries = [
            'flower_of_life', 'merkaba', 'sri_yantra', 'vesica_piscis', 
            'golden_spiral', 'platonic_solids', 'torus', 'double_helix'
        ]
        
        selected_geometry = geometries[geometry_seed % len(geometries)]
        
        return {
            'type': selected_geometry,
            'seed': geometry_seed,
            'opacity': 0.3,
            'color': '#ffffff',
            'animation': 'slow_rotation'
        }

    def _generate_cosmic_signature(self, code: str) -> str:
        """Generate cosmic signature for code"""
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        signature_chars = '✦✧✪✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄❅❆❇❈❉❊❋'
        
        signature = ''
        for i in range(0, 16, 2):
            char_index = int(code_hash[i:i+2], 16) % len(signature_chars)
            signature += signature_chars[char_index]
        
        return signature[:8]  # Return 8-character cosmic signature

    def _generate_cosmic_coordinates(self) -> Dict[str, float]:
        """Generate cosmic coordinates for NFT"""
        return {
            'x': random.uniform(-1000, 1000),
            'y': random.uniform(-1000, 1000),
            'z': random.uniform(-1000, 1000),
            'dimension': random.choice(['prime', 'parallel', 'quantum', 'astral'])
        }

    def _calculate_vibrational_frequency(self, code: str) -> float:
        """Calculate vibrational frequency of code"""
        # Base frequency using golden ratio
        golden_ratio = 1.618033988749
        code_hash = hashlib.sha256(code.encode()).hexdigest()
        frequency_seed = int(code_hash[:8], 16)
        
        base_frequency = 432  # Hz - cosmic frequency
        vibration = base_frequency * (golden_ratio ** (frequency_seed % 12))
        
        return round(vibration, 2)

    def _estimate_marketplace_value(self, rarity: str, analysis: Dict) -> Dict[str, Any]:
        """Estimate marketplace value for NFT"""
        
        rarity_multiplier = self.rarity_tiers[rarity]['multiplier']
        
        # Base value calculation
        base_value = 0.01  # 0.01 ETH base
        quality_bonus = (
            analysis['complexity_score'] + 
            analysis['creativity_score'] + 
            analysis['uniqueness_score']
        ) / 3
        
        estimated_value = base_value * rarity_multiplier * (1 + quality_bonus)
        
        return {
            'estimated_eth': round(estimated_value, 4),
            'estimated_usd': round(estimated_value * 2000, 2),  # Assuming ETH = $2000
            'rarity_multiplier': rarity_multiplier,
            'quality_bonus': round(quality_bonus * 100, 1)
        }

    async def create_nft_marketplace(self, user_id: str) -> Dict[str, Any]:
        """Create cosmic NFT marketplace listing"""
        try:
            # Get user's NFT collection
            user_nfts = await self.db.nft_collection.find({'owner_id': user_id}).to_list(100)
            
            marketplace = {
                'marketplace_id': str(uuid.uuid4()),
                'owner_id': user_id,
                'nft_collection': user_nfts,
                'featured_nfts': random.sample(user_nfts, min(3, len(user_nfts))),
                'marketplace_stats': await self._calculate_marketplace_stats(user_nfts),
                'cosmic_ranking': await self._calculate_cosmic_ranking(user_nfts),
                'created_at': datetime.utcnow()
            }
            
            await self.db.nft_marketplaces.insert_one(marketplace.copy())
            
            return {
                'success': True,
                'marketplace_id': marketplace['marketplace_id'],
                'total_nfts': len(user_nfts),
                'marketplace_stats': marketplace['marketplace_stats'],
                'cosmic_ranking': marketplace['cosmic_ranking'],
                'marketplace_url': f'/api/vibranium/marketplace/{marketplace["marketplace_id"]}',
                'message': 'Cosmic NFT marketplace created - Your code artifacts await cosmic collectors!'
            }
            
        except Exception as e:
            logger.error(f"NFT marketplace creation failed: {e}")
            return {'success': False, 'error': str(e)}

    async def _calculate_marketplace_stats(self, nfts: List[Dict]) -> Dict[str, Any]:
        """Calculate marketplace statistics"""
        if not nfts:
            return {
                'total_value': 0,
                'rarity_distribution': {},
                'most_valuable': None,
                'total_lines_of_code': 0
            }
        
        rarity_count = {}
        total_lines = 0
        most_valuable = None
        max_value = 0
        
        for nft in nfts:
            rarity = nft.get('rarity', 'common')
            rarity_count[rarity] = rarity_count.get(rarity, 0) + 1
            
            if 'metadata' in nft and 'attributes' in nft['metadata']:
                for attr in nft['metadata']['attributes']:
                    if attr['trait_type'] == 'Lines of Code':
                        total_lines += attr['value']
            
            # Simplified value calculation
            rarity_value = self.rarity_tiers[rarity]['multiplier']
            if rarity_value > max_value:
                max_value = rarity_value
                most_valuable = nft
        
        return {
            'total_nfts': len(nfts),
            'rarity_distribution': rarity_count,
            'most_valuable': most_valuable,
            'total_lines_of_code': total_lines,
            'estimated_total_value': sum(self.rarity_tiers[rarity]['multiplier'] for rarity in rarity_count.keys())
        }

    async def _calculate_cosmic_ranking(self, nfts: List[Dict]) -> Dict[str, Any]:
        """Calculate cosmic ranking for NFT collection"""
        if not nfts:
            return {'rank': 'Initiate', 'points': 0}
        
        total_points = 0
        for nft in nfts:
            rarity = nft.get('rarity', 'common')
            total_points += self.rarity_tiers[rarity]['multiplier'] * 100
        
        # Determine cosmic rank
        if total_points >= 5000:
            rank = 'Cosmic Deity'
        elif total_points >= 2000:
            rank = 'Galactic Master'
        elif total_points >= 800:
            rank = 'Stellar Creator'
        elif total_points >= 300:
            rank = 'Digital Alchemist'
        elif total_points >= 100:
            rank = 'Code Artisan'
        else:
            rank = 'Initiate'
        
        return {
            'rank': rank,
            'points': total_points,
            'progress_to_next': self._calculate_progress_to_next_rank(total_points)
        }

    def _calculate_progress_to_next_rank(self, current_points: float) -> Dict[str, Any]:
        """Calculate progress to next cosmic rank"""
        rank_thresholds = [0, 100, 300, 800, 2000, 5000]
        
        for i, threshold in enumerate(rank_thresholds[1:], 1):
            if current_points < threshold:
                return {
                    'points_needed': threshold - current_points,
                    'percentage': (current_points - rank_thresholds[i-1]) / (threshold - rank_thresholds[i-1]) * 100
                }
        
        return {'points_needed': 0, 'percentage': 100}  # Max rank achieved

# Global Vibranium NFT service instance
_vibranium_nft_service = None

def init_vibranium_nft_service(db_manager):
    """Initialize the Vibranium NFT service with database manager"""
    global _vibranium_nft_service
    _vibranium_nft_service = VibraniumNFTService(db_manager)
    logger.info("💎 Vibranium NFT Service initialized - Cosmic blockchain economy ready!")

def get_vibranium_nft_service() -> Optional[VibraniumNFTService]:
    """Get the initialized Vibranium NFT service instance"""
    return _vibranium_nft_service