import React from "react";
import { User } from "../../../App.types";

interface StyledUserSelectProps {
  users: User[]
  handleChange: Function
  userId: number
}

const StyledUserSelect: React.FC<StyledUserSelectProps> = ({ users, handleChange, userId }) => {
  return (
    <select className="py-2 px-2 bg-gray-900 text-gray-300 border-gray-600 rounded-lg" onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>} defaultValue="DEFAULT" required>
      <option disabled value="DEFAULT" label="Select a user"></option>
      {users.map((user) => user.id === userId ? null : <option key={user.id} value={user.id}>{user.name}</option>)}
    </select>

  );

}

export default StyledUserSelect