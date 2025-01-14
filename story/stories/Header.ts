import './Button';
import './header.css';
import { El } from './el';


type User = {
  name: string;
};

export class Header extends El {
  user?: User;
  onLogin: () => void = ()=>{};
  onLogout: () => void = ()=>{};
  onCreateAccount: () => void = ()=>{};

  styles(css:any){
    return css`.storybook-header {
      font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .storybook-header svg {
      display: inline-block;
      vertical-align: top;
    }
    
    .storybook-header h1 {
      font-weight: 700;
      font-size: 20px;
      line-height: 1;
      margin: 6px 0 6px 10px;
      display: inline-block;
      vertical-align: top;
    }
    
    .storybook-header button + button {
      margin-left: 10px;
    }
    
    .storybook-header .welcome {
      color: #333;
      font-size: 14px;
      margin-right: 10px;
    }
    `;
  }
  render(html: any) {
    const { user} = this;
    console.log(user)
    return html`
     <header>
       <div class="storybook-header">
         <div>
           <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
             <g fill="none" fillRule="evenodd">
               <path
                 d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z"
                 fill="#FFF"
               />
               <path
                 d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z"
                 fill="#555AB9"
               />
               <path
                 d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z"
                 fill="#91BAF8"
               />
             </g>
           </svg>
           <h1>Acme</h1>
         </div>
         <div>
            ${user
              ?html`<t-button size='small' onClick=${this.onLogout} label='${`Log out `+user.name}' />`
              :html`<t-button size='small' onClick=${this.onLogin} label='Log in'></t-button>
                <t-button primary=true size='small' onClick=${this.onCreateAccount} label='Sign up'></t-button>`
            }
         </div>
       </div>
     </header>
   `;
  }
}


window.customElements.define('t-header', Header)