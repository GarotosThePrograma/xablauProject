import './RegisterLogin.css';

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema } from './schemas/authSchema'


export function Login() {

  const {
    register,

    // faz os dados passarem pela regras que criei fora do componente, caso reprove joga isso dentro do errors
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema), // o RHF agora sabe que deve usar o Zod
  });

  const enviarDados = async (dadosValidados) => {
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
      localStorage.setItem('usuarioId', data.usuarioId);
      localStorage.setItem('nome', data.nome);

      console.log('Login realizado com sucesso', data);
      return;
    }

    console.log('Erro no login', data);
  };


  return (
    <div className="login-wrapper">
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
              required 

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
              required 

              /* o resgister faz o input ser controlado pelo RHF */
              { ...register("password") }
            />
            {errors.password && <span className='incorrect'>{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-primary">Entrar</button>

          <p>
            Não tem uma conta? <Link to="/register" className='not-registered-yet'>Cadastre-se</Link>
          </p>
        </form>

      </div>
    </div>
  );
}