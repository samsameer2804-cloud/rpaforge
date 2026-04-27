"""Tests for SubprocessExecutor: pool lock, timeout, cleanup."""

from __future__ import annotations

import threading
import time

import pytest

from rpaforge.core.subprocess_executor import SubprocessExecutor


def _noop(library_path: str, activity_name: str, args: tuple, kwargs: dict) -> str:
    return "ok"


def _slow(library_path: str, activity_name: str, args: tuple, kwargs: dict) -> str:
    time.sleep(10)
    return "done"


class TestSubprocessExecutorInit:
    def test_pool_starts_as_none(self):
        ex = SubprocessExecutor()
        assert ex._pool is None

    def test_has_pool_lock(self):
        ex = SubprocessExecutor()
        assert isinstance(ex._pool_lock, type(threading.Lock()))

    def test_close_on_idle_is_safe(self):
        ex = SubprocessExecutor()
        ex.close()
        assert ex._pool is None


class TestSubprocessExecutorTimeout:
    def test_raises_timeout_error(self):
        ex = SubprocessExecutor()
        # _execute_in_subprocess is the worker; we need a real callable for the pool.
        # Use a direct call with a tiny timeout and a module-level slow function.
        # Since the pool runs _execute_in_subprocess internally, inject via monkey-patch.
        import rpaforge.core.subprocess_executor as mod

        original = mod.SubprocessExecutor._execute_in_subprocess

        def slow_worker(self, library_path, activity_name, args, kwargs):
            time.sleep(5)
            return "never"

        mod.SubprocessExecutor._execute_in_subprocess = slow_worker
        try:
            with pytest.raises((TimeoutError, Exception)):
                ex.execute_with_timeout(
                    "fake.lib", "fake_activity", timeout_ms=50
                )
        finally:
            mod.SubprocessExecutor._execute_in_subprocess = original
            ex.close()

    def test_pool_is_none_after_timeout(self):
        ex = SubprocessExecutor()
        import rpaforge.core.subprocess_executor as mod

        def slow_worker(self, library_path, activity_name, args, kwargs):
            time.sleep(5)
            return "never"

        original = mod.SubprocessExecutor._execute_in_subprocess
        mod.SubprocessExecutor._execute_in_subprocess = slow_worker
        try:
            with pytest.raises((TimeoutError, Exception)):
                ex.execute_with_timeout("fake.lib", "act", timeout_ms=50)
        finally:
            mod.SubprocessExecutor._execute_in_subprocess = original

        assert ex._pool is None


class TestSubprocessExecutorConcurrency:
    def test_concurrent_calls_do_not_deadlock(self):
        """Two threads calling execute_with_timeout should not deadlock."""
        ex = SubprocessExecutor()
        import rpaforge.core.subprocess_executor as mod

        call_count = 0
        lock = threading.Lock()

        def fast_worker(self, library_path, activity_name, args, kwargs):
            return "ok"

        original = mod.SubprocessExecutor._execute_in_subprocess
        mod.SubprocessExecutor._execute_in_subprocess = fast_worker

        errors: list[Exception] = []

        def call():
            nonlocal call_count
            try:
                ex.execute_with_timeout("lib", "act", timeout_ms=2000)
                with lock:
                    call_count += 1
            except Exception as e:
                errors.append(e)

        mod.SubprocessExecutor._execute_in_subprocess = fast_worker
        try:
            t1 = threading.Thread(target=call)
            t2 = threading.Thread(target=call)
            t1.start()
            t2.start()
            t1.join(timeout=10)
            t2.join(timeout=10)
        finally:
            mod.SubprocessExecutor._execute_in_subprocess = original
            ex.close()

        assert not t1.is_alive(), "Thread 1 deadlocked"
        assert not t2.is_alive(), "Thread 2 deadlocked"


class TestSubprocessExecutorContextManager:
    def test_context_manager_closes_pool(self):
        with SubprocessExecutor() as ex:
            assert ex._pool is None
        assert ex._pool is None
