import { CSSProperties } from "react";
import watLogoLight from "../../assets/wat_logo_light.png";

export const BackgroundLogo = () => {
  const style: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    backgroundImage: `url(${watLogoLight})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    opacity: 0.07,
    pointerEvents: 'none',
    zIndex: 0,
  };

  return <div className="background-logo" style={style} />;
};
