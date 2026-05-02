"""Pytest configuration for libraries tests."""

from __future__ import annotations

import sys
from pathlib import Path

libs_src = Path(__file__).parent.parent / "src"
if str(libs_src) not in sys.path:
    sys.path.insert(0, str(libs_src))
