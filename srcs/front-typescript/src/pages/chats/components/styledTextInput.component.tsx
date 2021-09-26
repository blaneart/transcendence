import React from "react";

interface StyledTextInputProps {
  onChange: Function
}

const StyledTextInput: React.FC<StyledTextInputProps> = ({onChange}) => {
  return (<input className="py-2 flex-1 rounded-lg bg-gray-900 text-gray-300 border-gray-600 hover:border-gray-200 focus:border-gray-200" type="text" onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}/>);

}

export default StyledTextInput