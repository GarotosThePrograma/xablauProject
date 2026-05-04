import './RegisterLogin.css';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema } from './schemas/authSchema'
import { PageLoadingBar } from '../../../components/common/PageLoadingBar';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';


export function Login() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const loginAdmin = useAdminAuthStore((state) => state.loginAdmin);
  const logoutAdmin = useAdminAuthStore((state) => state.logoutAdmin);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,

    // faz os dados passarem pela regras que criei fora do componente, caso reprove joga isso dentro do errors
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema), // o RHF agora sabe que deve usar o Zod
  });

  const enviarDados = async (dadosValidados) => {
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const adminLoggedIn = loginAdmin(dadosValidados.email, dadosValidados.password);

      if (adminLoggedIn) {
        logout();
        setFeedback({ type: 'success', message: 'Login de administrador realizado com sucesso' });
        window.location.assign('/admin/produtos');
        return;
      }

      logoutAdmin();

      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: dadosValidados.email,
          senha: dadosValidados.password,
        }),
      });

      const data = await response.json();

      if (data.sucesso) {
        login({
          usuarioId: data.usuarioId,
          nome: data.nome,
          email: data.email,
        });

        setFeedback({ type: 'success', message: data.mensagem || 'Login realizado com sucesso' });
        window.location.assign('/');
        return;
      }

      setFeedback({ type: 'error', message: data.mensagem || 'Email ou senha inválidos' });
    } catch {
      setFeedback({ type: 'error', message: 'Não foi possível conectar ao servidor' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="login-wrapper">
      {isSubmitting && <PageLoadingBar />}
      <div className="login-card">
        
        <div className="login-header">
          <h2>Acesse sua conta</h2>
          <p>Digite seu e-mail e senha abaixo para entrar</p>
        </div>

        <form onSubmit={handleSubmit(enviarDados)} className="login-form">
          <div className="input-group">
            <label htmlFor="email">E-mail:</label>
            
            <input 
              id="email" 
              type="email" 
              placeholder="seuemail@aqui.com"
              autoComplete='off' 

              /* o resgister faz o input ser controlado pelo RHF */
              { ...register("email") }
            />
            {errors.email && <span className='incorrect' >{errors.email.message}</span>}
          </div>

          <div className="input-group">
            <div className="password-header">
              <label htmlFor="password">Senha:</label>
              
            </div>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••" 

              /* o resgister faz o input ser controlado pelo RHF */
              { ...register("password") }
            />
            {errors.password && <span className='incorrect'>{errors.password.message}</span>}
          </div>

          {feedback.message && (
            <span className={`auth-message ${feedback.type}`}>
              {feedback.message}
            </span>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <p>
            Não tem uma conta? <Link to="/register" className='not-registered-yet'>Cadastre-se</Link>
          </p>
        </form>

      </div>
    </div>
  );
}
