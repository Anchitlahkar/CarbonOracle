import React from 'react';
import { ShieldAlert, RefreshCw, LogIn } from 'lucide-react';
import { Panel } from './Panel';
import { useNavigate } from 'react-router-dom';
import useCarbonStore from '../../store/carbonStore';

interface PanelErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const PanelError: React.FC<PanelErrorProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  const navigate = useNavigate();
  const { logout } = useCarbonStore();

  let title = 'Telemetry Audit Failure';
  let displayMessage = message;
  let buttonLabel = '[ RETRY telemetry FETCH ]';
  let buttonIcon = <RefreshCw size={16} />;
  let handleAction = onRetry;

  if (message === 'session_expired') {
    title = 'Session Expired';
    displayMessage = 'For security, your session has expired. Please sign in again to continue using CarbonSense.';
    buttonLabel = '[ Sign In Again ]';
    buttonIcon = <LogIn size={16} />;
    handleAction = async () => {
      await logout();
      navigate('/auth');
    };
  } else if (message === 'network_issue') {
    title = 'Connection Problem';
    displayMessage = 'Unable to reach CarbonSense services. Please check your connection and try again. Your data has not been lost.';
    buttonLabel = '[ Retry ]';
    buttonIcon = <RefreshCw size={16} />;
    handleAction = onRetry;
  } else if (message === 'system_unavailable') {
    title = 'CarbonSense is temporarily unavailable.';
    displayMessage = 'Please try again shortly.';
    buttonLabel = '[ Retry ]';
    buttonIcon = <RefreshCw size={16} />;
    handleAction = onRetry;
  }

  return (
    <Panel className={`flex flex-col items-center justify-center text-center p-8 border-accent-red/20 ${className}`}>
      <div className="w-12 h-12 rounded bg-accent-red/5 flex items-center justify-center border border-accent-red/10 text-accent-red mb-4 shadow-inner">
        <ShieldAlert size={24} />
      </div>
      <h4 className="text-[24px] font-bold font-display text-text-primary mb-2 tracking-wider uppercase">{title}</h4>
      <p className="text-[16px] text-text-muted font-body mb-5 max-w-md leading-relaxed">{displayMessage}</p>
      {handleAction && (
        <button
          onClick={handleAction}
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-text-primary rounded text-[16px] font-mono border border-white/10 hover:border-white/20 transition-all flex items-center space-x-2 cursor-pointer"
        >
          {buttonIcon}
          <span>{buttonLabel}</span>
        </button>
      )}
    </Panel>
  );
};

export default PanelError;
