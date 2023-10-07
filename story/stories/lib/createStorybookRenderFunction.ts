export function createStorybookRenderFunction(tagName: string){
    return (args: any) => {
        const button = document.createElement(tagName)
        for(const prop in args){
          const val = args[prop];
          if(typeof val === 'object' || typeof val === 'function'){
            (button as any)[prop] = val;
          }else{
            button.setAttribute(prop, val);
          }
        }
        return button;
      }
}