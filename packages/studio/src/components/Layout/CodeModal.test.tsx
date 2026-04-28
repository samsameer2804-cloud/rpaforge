import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import CodeModal from './CodeModal';

describe('CodeModal', () => {
  test('switches between generated files when a bundle is provided', () => {
    const { container } = render(
      <CodeModal
        isOpen
        code={'*** Tasks ***\nMain Process'}
        files={{
          'processes/main.robot': '*** Tasks ***\nMain Process',
          'processes/auth/login.flow.robot': '*** Keywords ***\nLogin Flow',
        }}
        fileCount={2}
        onClose={vi.fn()}
        onDownload={vi.fn()}
      />
    );

    const codeBlocks = container.querySelectorAll('code');
    const mainCode = Array.from(codeBlocks).find((el) => el.textContent?.includes('*** Tasks ***'));
    expect(mainCode).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'processes/auth/login.flow.robot' }));

    const codeBlocksAfter = container.querySelectorAll('code');
    const authCode = Array.from(codeBlocksAfter).find((el) => el.textContent?.includes('*** Keywords ***'));
    expect(authCode).toBeTruthy();
  });
});
