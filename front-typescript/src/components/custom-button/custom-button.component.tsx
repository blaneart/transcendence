import React from 'react';
import background from '../../assets/Unkown.png';
import './custom-button.styles.scss';

interface IButtonProps {
    children: string,
    onClick: React.MouseEventHandler<HTMLButtonElement>
}

const CustomButton: React.FC<IButtonProps> = ({children, ...otherProps }) => (
     <button className='custom-button' {...otherProps }>
                      <div
      className='image'
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + '/42.png'})`
      }}
    />
         <div className='text'>
         {children}
                      </div>


     </button>
)

export default CustomButton; 