import React from "react";

interface styledButtonProps {
  onClick: Function
  children: any
}

const StyledButton: React.FC<styledButtonProps> = ({onClick, children}) => {
  return (<button className="bg-gray-900 text-gray-300 border-gray-600 rounded-lg ml-0 px-3 py-2 hover:bg-white hover:text-black" onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}>{children}</button>);

}

export default StyledButton