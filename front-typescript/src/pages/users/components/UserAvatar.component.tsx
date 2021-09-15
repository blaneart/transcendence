import Avatar from "boring-avatars";
import { User } from "../../../App.types";

interface UserAvatarProps {
  user: User;
}

const UserAvatar = ({ user }: UserAvatarProps) => {

  if (user.realAvatar)
    return <img className="realAvatar" src={`http://127.0.0.1:3000/static/${user.avatar}`} width={150} height={150} alt="Avatar"></img>;
  else
    return <Avatar size={150} name={"" + user.id42} variant="beam"/>;
  
};

export default UserAvatar;
