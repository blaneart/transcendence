import React from 'react';
import './custom-button.styles.scss';

interface IButtonProps {
    children: string,
    isLogged: 1 | 0,
    onClick: React.MouseEventHandler<HTMLButtonElement>
    avatar_name?: string | null
    realAvatar?: boolean | boolean
}

const CustomButton: React.FC<IButtonProps> = ({children, isLogged, avatar_name, realAvatar, ...otherProps }) => (
    <button className='custom-button' {...otherProps }>
      <div
      className='image'
      style={{
        backgroundImage: isLogged ?
        (realAvatar ? `url(${process.env.REACT_APP_API_URL}/static/${avatar_name})` : `url(https://source.boringavatars.com/beam/150/${avatar_name})`)
        :
        `url(${process.env.PUBLIC_URL + '/42.png'})`
      }}
      />
      <div className='text'>
        {children}
      </div>
    </button>
)

export default CustomButton;