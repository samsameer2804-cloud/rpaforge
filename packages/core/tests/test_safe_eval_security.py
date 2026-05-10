"""
Tests for AST-based parameter validation in safe evaluator.
"""

from __future__ import annotations

from rpaforge.core.safe_evaluator import (
    ConditionParser,
)


class TestSafeEvaluatorValidation:
    """Tests for AST-based parameter validation."""

    def test_normal_expression_allowed(self):
        """Test that normal expressions still work."""
        parser = ConditionParser({"x": 5})
        assert parser.evaluate("x + 1") is True
        assert parser.evaluate("x > 3") is True
        assert parser.evaluate('"hello".upper()') is True
        assert parser.evaluate('len("test") > 0') is True
