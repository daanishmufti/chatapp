import { useState, useEffect} from 'react'

function Auth({supabase}) {
    const [email, setEmail] = useState('');
    const [password, SetPassword] = useState('');
    const [error, setError] = useState(null);
    const [issignup, setIssignup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if(issignup)
        {
            const { error } = await supabase.auth.signUp({
                email,
                password
            })

            if(error)
            {
                setError(error.message)
            }
        }
        else
        {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if(error)
            {
                setError(error.message)
            }
        }
    }
    
    return (
        <div className='auth-cont'>
            <div className='auth-brand'>
                <span className='auth-brand-icon'>🎓</span>
                <h1 className='auth-brand-title'>Student Chat App</h1>
            </div>
            <h2>{issignup ? 'Sign up' : 'Sign in'}</h2>
            <p className='auth-subtitle'>{issignup ? 'Create your account to start chatting' : 'Welcome back'}</p>
            <form onSubmit={handleSubmit}>
            <input type="email" placeholder='Email' value={email}
            onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder='Password' value={password}
            onChange={e => SetPassword(e.target.value)} required />
            <button type="submit">
                {issignup ? 'Sign up' : 'Sign in'}
            </button>
            </form>
            {error && <div className='error'>{error}</div>}
            <div>
                {issignup ? (
                    <span>
                        Already have an account ?{' '}
                        <button type="button" onClick={() => setIssignup(false)}>Sign In</button>
                    </span>
                ) :
                (
                    <span>
                        Dont't have an account ?{' '}
                        <button type='button' onClick={() => setIssignup(true)}>Sign Up</button>
                    </span>
                )}
            </div>
        </div>
    )
}

export default Auth;