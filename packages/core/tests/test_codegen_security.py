"""
Tests for security features in Python code generator.
"""

from __future__ import annotations

import pytest

from rpaforge.codegen.python_generator import (
    MAX_STRING_LENGTH,
    _sanitize_string,
    _validate_variable_name,
)

class TestSanitizeString:
    """Tests for _sanitize_string function."""

    def test_invalid_surrogates_removed(self):
        """Test that invalid UTF-16 surrogate characters are removed."""
        # Surrogate pairs are encoded as separate codepoints in Python
        result = _sanitize_string("Hello\ud800World")
        assert result == "HelloWorld"

    def test_length_limit(self):
        """Test that strings exceeding max length raise ValueError."""
        long_string = "x" * (MAX_STRING_LENGTH + 1)
        with pytest.raises(ValueError, match="exceeds maximum allowed"):
            _sanitize_string(long_string)

    def test_control_characters_removed(self):
        """Test that control characters raise ValueError."""
        with pytest.raises(ValueError, match="Control character"):
            _sanitize_string("Hello\x01World")

    def test_backslash_escaped(self):
        """Test that backslashes are properly escaped."""
        result = _sanitize_string(r"Path\to\file")
        assert result == r"Path\\to\\file"

    def test_quotes_escaped(self):
        """Test that quotes are properly escaped."""
        result = _sanitize_string('He said "Hello"')
        assert result == r"He said \"Hello\""

    def test_normal_string_preserved(self):
        """Test that normal strings are preserved."""
        result = _sanitize_string("Hello World")
        assert result == "Hello World"

    def test_non_string_input_raises_type_error(self):
        """Test that non-string input raises TypeError."""
        with pytest.raises(TypeError):
            _sanitize_string(123)

    def test_whitespace_preserved(self):
        """Test that standard whitespace characters are preserved."""
        result = _sanitize_string("Hello\t\n\rWorld")
        assert result == "Hello\t\n\rWorld"


class TestValidateVariableName:
    """Tests for _validate_variable_name function."""

    def test_valid_variable_name(self):
        """Test that valid variable names pass validation."""
        _validate_variable_name("my_variable")
        _validate_variable_name("_private")
        _validate_variable_name("Variable123")

    def test_empty_name_raises_error(self):
        """Test that empty variable name raises error."""
        with pytest.raises(ValueError, match="Invalid variable name format"):
            _validate_variable_name("")

    def test_starts_with_number_raises_error(self):
        """Test that names starting with number raise error."""
        with pytest.raises(ValueError, match="Invalid variable name format"):
            _validate_variable_name("123variable")

    def test_space_in_name_raises_error(self):
        """Test that names with spaces raise error."""
        with pytest.raises(ValueError, match="Invalid variable name format"):
            _validate_variable_name("my variable")

    def test_reserved_keyword_raises_error(self):
        """Test that Python reserved keywords raise error."""
        for kw in ["class", "def", "return", "if", "else", "for", "while"]:
            with pytest.raises(ValueError, match="Python reserved keyword"):
                _validate_variable_name(kw)

    def test_variable_name_length_limit(self):
        """Test that variable names exceeding max length raise error."""
        long_name = "x" * 150
        with pytest.raises(ValueError, match="exceeds maximum"):
            _validate_variable_name(long_name)
