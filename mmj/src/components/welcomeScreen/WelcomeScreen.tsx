import { MessageInput } from '../messageInput';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  welcomeMessage: string;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const WelcomeScreen = ({
  welcomeMessage,
  onSendMessage,
  isLoading,
  onCancel
}: WelcomeScreenProps) => {
  return (
    <div className="welcome-screen">
      <h1 className="welcome-title">{welcomeMessage}</h1>
      <div className="welcome-input-wrapper">
        <MessageInput
          onSendMessage={onSendMessage}
          onCancel={onCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;
