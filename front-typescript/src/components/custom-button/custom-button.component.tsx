import React from 'react';
import background from '../../assets/Unkown.png';
import './custom-button.styles.scss';

interface IButtonProps {
    children: string,
    isLogged: 1 | 0,
    onClick: React.MouseEventHandler<HTMLButtonElement>
    avatar_name?: string | null
}

const CustomButton: React.FC<IButtonProps> = ({children, isLogged, avatar_name,  ...otherProps }) => ( 
     <button className='custom-button' {...otherProps }>
                      <div
      className='image'
      style={{
        backgroundImage: isLogged ? `url(https://source.boringavatars.com/beam/150/${avatar_name})` :
          `url(${process.env.PUBLIC_URL + '/42.png'})`
      }}
    />
         <div className='text'>
         {children}
                      </div>


     </button>
)

export default CustomButton; 