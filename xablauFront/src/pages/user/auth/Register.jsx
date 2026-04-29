import './RegisterLogin.css';

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema } from './schemas/authSchema';

export function Register() {

  const {
    register,

    // faz os dados passarem pela regras que criei fora do componente, caso reprove joga isso dentro do errors
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema), // o RHF agora sabe que deve usar o Zod
  });

  const enviarDados = async (dadosValidados) => {
    const response = await fetch('http://localhost:5002/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: dadosValidados.name,
        email: dadosValidados.email,
        senha: dadosValidados.password,
      }),
    });

    const data = await response.json();

    if (data.sucesso) {
      console.log('Cadastro realizado com sucesso', data);
      return;
    }

    console.log('Erro no cadastro', data);
  };


  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        <div className="login-header">
          <h2>Crie uma conta</h2>
          <p>Digite seu nome, e-mail e senha abaixo para efetuar o cadastro</p>
        </div>

        <form onSubmit={handleSubmit(enviarDados)} className="login-form">
          <div className="input-group">

            <label htmlFor="name">Nome:</label>
            <input 
              id='name'
              type='text'
              placeholder='Seu nome'
              autoComplete='Off'
              required

              /* injeta o nome no RHF */
              { ...register("name") }
            />
            {errors.name && <span className='incorrect' >{errors.name.message}</span>}

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
            Já tem uma conta? <Link to="/login" className='not-registered-yet'>Entre</Link>
          </p>
        </form>

      </div>
    </div>
  );
}