import { User } from "../../../App.types";


async function uploadHandler(authToken: string, setUser: Function) {
  var input: HTMLInputElement | null = document.querySelector('input[type="file"]')

  if (!input || !input.files)
  {
    alert("First select a file");
    return;
  }
  var data = new FormData()
  data.append('picture', input.files[0])
  // data.append('user', 'hubot')

  const response = await fetch('http://127.0.0.1:3000/uploadAvatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: data
  })

  const jsonData = await response.json();
  const userUpdate = jsonData as User;

  setUser(userUpdate);
  localStorage.setItem("pongUser", JSON.stringify(userUpdate));
  // alert('Im clicked');
}

async function removeHandler(authToken: string, setUser: Function) {
  
  const response = await fetch('http://127.0.0.1:3000/removeAvatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
  })

  const jsonData = await response.json();
  const userUpdate = jsonData as User;

  setUser(userUpdate);
  localStorage.setItem("pongUser", JSON.stringify(userUpdate));
  // alert('Im clicked');
}


interface AvatarProps
{
  user: User;
  authToken: string;
  setUser: Function;
}

const AvatarUpload = ({user, authToken, setUser }: AvatarProps) => {
  return (
    <div className="file-uploader">
    
        <p>Avatar upload</p>
        {
          user.realAvatar ? 
            <button onClick={() => {removeHandler(authToken, setUser)}}>Remove your avatar</button>
          :
          <div>
            <input type="file"/>
            <button onClick={() => {uploadHandler(authToken, setUser)}}>Upload</button>
          </div>
        }
            
    </div>
  );
}

export default AvatarUpload;