import React, { useEffect, useState } from 'react';
import './not-found.css';

export const NotFound: React.FC = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="not-found">
      <div className="not-found__bsod">
        <div className="not-found__header">
          <span className="not-found__header-text">SevanOS</span>
        </div>

        <div className="not-found__body">
          <p className="not-found__title">
            A fatal exception 0x00000404 has occurred at page you requested.
          </p>
          <br />
          <p>The page you are looking for does not exist or has been moved.</p>
          <br />
          <p>
            *&nbsp;&nbsp;Press any key to return to the desktop, or
          </p>
          <p>
            *&nbsp;&nbsp;Wait {countdown} second{countdown !== 1 ? 's' : ''} for auto-redirect.
          </p>
          <br />
          <p className="not-found__prompt">
            Press any key to continue <span className="not-found__cursor">_</span>
          </p>
        </div>
      </div>
    </div>
  );
};
