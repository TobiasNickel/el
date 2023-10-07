import { El } from "./el";

/**
 * Primary UI component for user interaction
 */
export class Button extends El {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean|string;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large";
  /**
   * Button contents
   */
  label: string = "[unnamed button]";
  /**
   * Optional click handler
   */
  onClick?: () => void;

  styles(css: any) {
    return css`
    .storybook-button {
      font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 700;
      border: 0;
      border-radius: 3em;
      cursor: pointer;
      display: inline-block;
      line-height: 1;
    }
    .storybook-button--primary {
      color: white;
      background-color: #1ea7fd;
    }
    .storybook-button--secondary {
      color: #333;
      background-color: transparent;
      box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
    }
    .storybook-button--small {
      font-size: 12px;
      padding: 10px 16px;
    }
    .storybook-button--medium {
      font-size: 14px;
      padding: 11px 20px;
    }
    .storybook-button--large {
      font-size: 16px;
      padding: 12px 24px;
    }
    `;
  }
  render(html: any) {
    const { primary, backgroundColor, size, label, onClick } = this;
    
    const mode = primary?.toString().toLowerCase()==='true'
      ? "storybook-button--primary"
      : "storybook-button--secondary";
    console.log({backgroundColor},this)
    return html`
      <button
        type="button"
        class=${[
          "storybook-button",
          `storybook-button--${size || "medium"}`,
          mode,
        ].join(" ")}
        @click=${onClick}
        style=${backgroundColor?`background-color:${backgroundColor}`:''}
      >
        ${label}
      </button>
    `;
  }
}

window.customElements.define('t-button', Button)
