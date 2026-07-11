import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="display-4">404</h1>
      <p className="text-muted">Page not found</p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
