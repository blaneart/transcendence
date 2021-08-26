import Avatar from "boring-avatars";

interface User {
  id: string;
  name: string;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean;
}

interface UserAvatarProps {
  user: User;
}

const UserAvatar = ({ user }: UserAvatarProps) => {

  if (user.realAvatar)
  {
    return <img className="realAvatar" src={`http://127.0.0.1:3000/static/${user.avatar}`} width={150} height={150}></img>;
  }
  else
  {
    return <Avatar size={150} name={user.avatar} variant="beam" />;
  }
  
};

export default UserAvatar;
