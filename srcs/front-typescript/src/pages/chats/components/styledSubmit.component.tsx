import React from "react";

interface StyledSubmitProps {
  value: string
}

const StyledSubmit: React.FC<StyledSubmitProps> = ({value}) => {
  return (<input className="cursor-pointer bg-gray-900 text-gray-300 border-gray-600 mx-2 px-2 py-2 rounded-lg hover:bg-white hover:text-black font-bold" type="submit" value={value}/>);

}

export default StyledSubmit