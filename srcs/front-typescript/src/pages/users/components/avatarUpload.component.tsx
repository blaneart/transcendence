import { User } from "../../../App.types";


async function uploadHandler(authToken: string, setUser: Function, onSet: Function) {
  var input: HTMLInputElement | null = document.querySelector('input[type="file"]')

  if (!input || !input.files)
  {
    alert("First select a file");
    return;
  }
  var data = new FormData()
  data.append('picture', input.files[0])
  // data.append('user', 'hubot')

  const response = await fetch(process.env.REACT_APP_API_URL + "/uploadAvatar", {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: data
  })
  if (!response.ok)
  {
    if (response.status === 400)
    {
      const jsonError = await response.json();
      return alert(`Error while uploading avatar: ${jsonError.message}. Sorry.`);
    }
    else if (response.status === 413)
      return alert(`Error while uploading avatar: The file is too large. Sorry.`);

    return alert(`Error while uploading avatar. Sorry.`);
  }
  const jsonData = await response.json();
  const userUpdate = jsonData as User;
  setUser(userUpdate);
  onSet();
  // alert('Im clicked');
}

async function removeHandler(authToken: string, setUser: Function, onSet: Function) {
  
  const response = await fetch(process.env.REACT_APP_API_URL + "/removeAvatar", {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
  })

  if (!response.ok)
    return null;

  const jsonData = await response.json();
  const userUpdate = jsonData as User;
  setUser(userUpdate);
  onSet();
  // alert('Im clicked');
}


interface AvatarProps
{
  user: User;
  authToken: string;
  setUser: Function;
  onSet: Function;
}

const AvatarUpload = ({user, authToken, setUser, onSet }: AvatarProps) => {
  return (
    <div className="file-uploader">
    
        <p>Avatar upload</p>
        {
          user.realAvatar ? 
            <button onClick={() => {removeHandler(authToken, setUser, onSet)}}>Remove your avatar</button>
          :
          <div>
            <input type="file" required/>
            <button onClick={() => {uploadHandler(authToken, setUser, onSet)}}>Upload</button>
          </div>
        }
            
    </div>
  );
}

export default AvatarUpload;