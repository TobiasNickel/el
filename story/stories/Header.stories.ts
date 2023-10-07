import type { Meta, StoryObj } from '@storybook/web-components';
import { Header } from './Header';
import { createStorybookRenderFunction } from './lib/createStorybookRenderFunction';

// log the Class so vite does not treeshake the component away.
console.log('Header story', Header.name)

const meta = {
  title: 'Example/Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/web-components/writing-docs/autodocs
  tags: ['autodocs'],
  render: createStorybookRenderFunction('t-header'),
} satisfies Meta<Header>;

export default meta;
type Story = StoryObj<Header>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
};

export const LoggedOut: Story = {};
