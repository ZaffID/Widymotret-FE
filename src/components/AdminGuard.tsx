import { Component, JSX, Show } from 'solid-js';
import { Navigate } from '@solidjs/router';
import { authStore } from '../stores/authStore';

interface AdminGuardProps {
  children: JSX.Element;
}

const AdminGuard: Component<AdminGuardProps> = (props) => {
  // Check authentication status
  const isAuthenticated = () => authStore.isAuthenticated();

  return (
    <Show 
      when={isAuthenticated()} 
      fallback={<Navigate href="/admin" />}
    >
      {props.children}
    </Show>
  );
};

export default AdminGuard;
