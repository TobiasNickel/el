import type { Meta, StoryObj } from '@storybook/web-components';

import { Page } from './Page';
import * as HeaderStories from './Header.stories';
import { createStorybookRenderFunction } from './lib/createStorybookRenderFunction';

// log the Class so vite does not treeshake the component away.
console.log('Page story', Page.name)

const meta = {
  title: 'Example/Page',
  render: createStorybookRenderFunction('t-page'),
} satisfies Meta<Page>;

export default meta;
type Story = StoryObj<Page>;

export const LoggedIn: Story = {
  args: {
    // More on composing args: https://storybook.js.org/docs/web-components/writing-stories/args#args-composition
    ...HeaderStories.LoggedIn.args,
  },
};

export const LoggedOut: Story = {
  args: {
    ...HeaderStories.LoggedOut.args,
  },
};
