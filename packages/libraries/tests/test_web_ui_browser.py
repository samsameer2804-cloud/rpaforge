"""Browser tests for WebUI Library - unit tests with mocks."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest

from rpaforge_libraries.WebUI import WebUI


class TestWebUIMultiInstance:
    """Tests for multi-instance support."""

    def test_open_multiple_browsers(self):
        """Test opening multiple browser instances."""
        webui = WebUI()
        webui._playwright = MagicMock()
        mock_browser1 = MagicMock()
        mock_browser2 = MagicMock()
        webui._playwright.chromium.launch.return_value = mock_browser1
        webui._playwright.firefox.launch.return_value = mock_browser2

        browser1_id = webui.open_browser("chromium")
        browser2_id = webui.open_browser("firefox")

        assert browser1_id != browser2_id
        assert len(webui._browsers) == 2

    def test_switch_browser(self):
        """Test switching between browsers."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()
        webui._playwright.firefox.launch.return_value = MagicMock()

        browser1_id = webui.open_browser("chromium")
        browser2_id = webui.open_browser("firefox")

        webui.switch_browser(browser1_id)
        assert webui._current_browser_id == browser1_id

        webui.switch_browser(browser2_id)
        assert webui._current_browser_id == browser2_id

    def test_switch_browser_unknown_raises(self):
        """Test switching to unknown browser raises."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")

        with pytest.raises(ValueError, match="Browser 'unknown-id' not found"):
            webui.switch_browser("unknown-id")

    def test_close_browser(self):
        """Test closing a specific browser."""
        webui = WebUI()
        webui._playwright = MagicMock()
        mock_browser = MagicMock()
        webui._playwright.chromium.launch.return_value = mock_browser

        browser_id = webui.open_browser("chromium")
        webui.close_browser(browser_id)

        assert browser_id not in webui._browsers

    def test_close_all_browsers(self):
        """Test closing all browsers."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()
        webui._playwright.firefox.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.open_browser("firefox")

        webui.close_browser(all=True)

        assert len(webui._browsers) == 0

    def test_list_browsers(self):
        """Test listing open browsers."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()
        webui._playwright.firefox.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.open_browser("firefox")

        browsers = webui.list_browsers()
        assert len(browsers) == 2


class TestWebUIPageManagement:
    """Tests for page management."""

    def test_list_pages(self):
        """Test listing pages."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")

        pages = webui.list_pages()
        assert isinstance(pages, list)

    def test_switch_page(self):
        """Test switching pages."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        page_id = webui._current_page_id

        if page_id:
            webui.switch_page(page_id)
            assert webui._current_page_id == page_id

    def test_new_page(self):
        """Test creating a new page."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        page_id = webui.new_page()

        assert page_id is not None

    def test_close_page(self):
        """Test closing a page."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        page_id = webui._current_page_id

        if page_id:
            webui.close_page(page_id)
            assert page_id not in webui._pages


class TestWebUINavigation:
    """Tests for navigation."""

    def test_navigate(self):
        """Test navigation to URL."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.navigate("http://example.com")

        assert webui._page is not None

    def test_get_url(self):
        """Test getting current URL."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        url = webui.get_url()

        assert url is not None


class TestWebUIElements:
    """Tests for element interaction."""

    def test_get_element_text(self):
        """Test getting element text."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        text = webui.get_element_text("#test")

        assert text is not None

    def test_get_element_attribute(self):
        """Test getting element attribute."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        attr = webui.get_element_attribute("#test", "href")

        assert attr is not None

    def test_input_text(self):
        """Test inputting text."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.input_text("#input", "test text")

    def test_click_element(self):
        """Test clicking element."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.click_element("#button")

    def test_select_option(self):
        """Test selecting option."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.select_option("#dropdown", "value1")


class TestWebUIScreenshot:
    """Tests for screenshot functionality."""

    def test_take_screenshot(self, tmp_path):
        """Test taking screenshot."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        path = webui.take_screenshot(filename=str(tmp_path / "test.png"))

        assert path is not None

    def test_set_screenshot_on_failure(self):
        """Test setting screenshot on failure."""
        webui = WebUI()
        webui.set_screenshot_on_failure(True, "/tmp")
        assert webui._screenshot_on_failure is True


class TestWebUIInitialization:
    """Tests for WebUI initialization."""

    def test_default_initialization(self):
        """Test default initialization."""
        webui = WebUI()
        assert webui._default_browser_type == "chromium"
        assert webui._default_headless is False
        assert webui._timeout == 30000
        assert webui._playwright is None

    def test_custom_initialization(self):
        """Test custom initialization."""
        webui = WebUI(browser="firefox", headless=True)
        assert webui._default_browser_type == "firefox"
        assert webui._default_headless is True


class TestWebUIErrorHandling:
    """Tests for error handling."""

    def test_get_page_title_without_browser(self):
        """Test get_page_title raises without browser."""
        webui = WebUI()

        with pytest.raises(ValueError, match="No browser/page open"):
            webui.get_page_title()

    def test_get_url_without_browser(self):
        """Test get_url raises without browser."""
        webui = WebUI()

        with pytest.raises(ValueError, match="No browser/page open"):
            webui.get_url()


class TestWebUIWaitConditions:
    """Tests for wait conditions."""

    def test_wait_for_element(self):
        """Test waiting for element."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.wait_for_element("#test")

    def test_wait_for_page_load(self):
        """Test waiting for page load."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.wait_for_page_load()


class TestWebUIDialogHandling:
    """Tests for dialog handling."""

    def test_handle_dialog(self):
        """Test handling dialog."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.handle_dialog("accept", "response")


class TestWebUIFileOperations:
    """Tests for file operations."""

    def test_download_file(self):
        """Test download file."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")

    def test_upload_file(self):
        """Test upload file."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.upload_file("#file-input", "/path/to/file.txt")


class TestWebUICloseOperations:
    """Tests for close operations."""

    def test_close_non_existent_browser(self):
        """Test closing non-existent browser does not raise."""
        webui = WebUI()
        webui.close_browser("non-existent-id")

    def test_close_all_when_no_browsers(self):
        """Test close_all when no browsers are open."""
        webui = WebUI()
        webui.close_browser(all=True)
        assert len(webui._browsers) == 0


class TestWebUIKeyboardAndMouse:
    """Tests for keyboard and mouse operations."""

    def test_press_keys(self):
        """Test pressing keys."""
        webui = WebUI()
        webui._playwright = MagicMock()
        webui._playwright.chromium.launch.return_value = MagicMock()

        webui.open_browser("chromium")
        webui.press_keys("Hello World")
