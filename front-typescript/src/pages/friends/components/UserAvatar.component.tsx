import Avatar from "boring-avatars";
import { User } from "../../../App.types";

interface UserAvatarProps {
  user: User;
}

const UserAvatar = ({ user }: UserAvatarProps) => {

  if (user.realAvatar)
    return <img className="realAvatar" src={`${process.env.REACT_APP_API_URL}/static/${user.avatar}`} width={150} height={150}></img>;
  else
    return <Avatar size={150} name={"" + user.id42} variant="beam" />;
  
};

export default UserAvatar;
