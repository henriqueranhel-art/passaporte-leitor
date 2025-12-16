import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '../components/ui';
import { AVATARS } from '../lib/types';
import { authApi } from '../lib/api';
import { useStore } from '../lib/store';

const COLORS = {
    primary: '#E67E22',
    primaryLight: '#FDEBD0',
    success: '#27AE60',
    background: '#FDFBF7',
    text: '#2C3E50',
};

// ============================================================================
// SCREENS
// ============================================================================

const EmailScreen = ({ onContinue }: { onContinue: (email: string, exists: boolean) => void }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email || !email.includes('@')) {
            setError('Por favor insere um email válido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { exists } = await authApi.checkEmail(email);
            onContinue(email, exists);
        } catch (err) {
            console.error(err);
            setError('Erro ao verificar email. Tenta novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text }}>
                    Olá! 👋
                </h1>
                <p className="text-gray-500">
                    Para começar a aventura, insere o email da família.
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <Input
                    label="Email da Família"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="exemplo@familia.com"
                    icon="✉️"
                    type="email"
                    error={error}
                />

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'A verificar...' : 'Continuar →'}
                </Button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
                Se já tiverem conta, pediremos a senha a seguir.
            </p>
        </div>
    );
};

const LoginScreen = ({ email, onBack, onLogin }: { email: string, onBack: () => void, onLogin: (data: any) => void }) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!password) return;

        setIsLoading(true);
        setError('');

        try {
            const data = await authApi.login(email, password);
            onLogin(data);
        } catch (err: any) {
            console.error(err);
            setError('Senha incorreta. Tenta novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                    Bem-vindos de volta!
                </h1>
                <p className="text-gray-500">
                    {email}
                </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <Input
                    label="Senha"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••"
                    type="password"
                    icon="🔒"
                    error={error}
                />

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'A entrar...' : 'Entrar na Aventura'}
                </Button>

                <button
                    onClick={onBack}
                    className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    ← Não é este o email?
                </button>
            </div>
        </div>
    );
};

const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from(
    { length: 15 }, // 15 anos de opções
    (_, i) => currentYear - 4 - i // Começar 4 anos atrás (excluir atual + 3 anteriores)
);

const RegisterScreen = ({ email, onBack, onRegister }: { email: string, onBack: () => void, onRegister: (data: any) => void }) => {
    const [step, setStep] = useState(1);
    const [familyName, setFamilyName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [childName, setChildName] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [childAvatar, setChildAvatar] = useState('🧒');

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleContinueToStep2 = () => {
        const newErrors: Record<string, string> = {};
        if (!familyName) newErrors.familyName = 'Nome da família é obrigatório';
        if (password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setStep(2);
    };

    const handleRegister = async () => {
        const newErrors: Record<string, string> = {};

        if (!childName) {
            newErrors.childName = 'Nome da criança é obrigatório';
        }

        if (!birthYear) {
            newErrors.birthYear = 'Seleciona o ano de nascimento';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors({ ...errors, ...newErrors });
            return;
        }

        setIsLoading(true);

        try {
            const data = await authApi.register({
                familyName,
                email,
                password,
                child: {
                    name: childName,
                    avatar: childAvatar,
                    birthYear: parseInt(birthYear),
                },
            });
            onRegister(data);
        } catch (err) {
            console.error(err);
            setErrors({ ...errors, submit: 'Erro ao criar conta. Tenta novamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                        Criar Família
                    </h1>
                    <p className="text-gray-500">
                        Vamos preparar o passaporte para a vossa viagem!
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="w-8 h-1 rounded" style={{ backgroundColor: COLORS.primary }} />
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <Input
                        label="Nome da Família"
                        value={familyName}
                        onChange={(e) => { setFamilyName(e.target.value); setErrors({ ...errors, familyName: '' }); }}
                        placeholder="Ex: Família Silva"
                        icon="🏠"
                        error={errors.familyName}
                    />

                    <Input
                        label="Criar Senha"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                        placeholder="Mínimo 6 caracteres"
                        type="password"
                        icon="🔒"
                        error={errors.password}
                    />

                    <Input
                        label="Confirmar Senha"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: '' }); }}
                        placeholder="Repete a senha"
                        type="password"
                        icon="🔒"
                        error={errors.confirmPassword}
                    />

                    <Button onClick={handleContinueToStep2} className="w-full">
                        Continuar →
                    </Button>

                    <button
                        onClick={onBack}
                        className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        ← Usar outro email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="text-6xl mb-4">{childAvatar}</div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                    Primeiro Explorador
                </h1>
                <p className="text-gray-500">
                    Quem vai começar a aventura?
                </p>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.success }} />
                <div className="w-8 h-1 rounded" style={{ backgroundColor: COLORS.primary }} />
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
                <Input
                    label="Nome"
                    value={childName}
                    onChange={(e) => { setChildName(e.target.value); setErrors({ ...errors, childName: '' }); }}
                    placeholder="Nome da criança"
                    icon="👤"
                    error={errors.childName}
                />

                <Select
                    label="Ano de nascimento"
                    value={birthYear}
                    onChange={(v) => { setBirthYear(v); setErrors({ ...errors, birthYear: '' }); }}
                    options={BIRTH_YEARS}
                    placeholder="Selecionar ano..."
                    icon="📅"
                    error={errors.birthYear}
                />

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: COLORS.text }}>
                        Avatar
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                        {AVATARS.map((a) => (
                            <button
                                key={a}
                                onClick={() => setChildAvatar(a)}
                                className={`w-10 h-10 rounded-xl text-xl transition-all ${childAvatar === a
                                    ? 'scale-110 shadow-lg ring-2 ring-orange-400'
                                    : 'opacity-60 hover:opacity-100'
                                    }`}
                                style={{
                                    backgroundColor: childAvatar === a ? COLORS.primaryLight : '#f3f4f6',
                                }}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleRegister}
                    disabled={isLoading}
                    variant="success"
                    className="w-full"
                >
                    {isLoading ? 'A criar família...' : '🎉 Criar Família'}
                </Button>

                <button
                    onClick={() => setStep(1)}
                    className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    ← Voltar
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AuthPage() {
    const [screen, setScreen] = useState<'email' | 'login' | 'register'>('email');
    const [email, setEmail] = useState('');
    const { setToken, setFamily } = useStore();
    const navigate = useNavigate();

    const handleEmailContinue = (emailValue: string, exists: boolean) => {
        setEmail(emailValue);
        setScreen(exists ? 'login' : 'register');
    };

    const handleSuccess = (data: any) => {
        setToken(data.token);
        if (data.family) setFamily(data.family);
        // Redirect to dashboard
        navigate('/');
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ backgroundColor: COLORS.background }}
        >
            {screen === 'email' && (
                <EmailScreen onContinue={handleEmailContinue} />
            )}

            {screen === 'login' && (
                <LoginScreen
                    email={email}
                    onBack={() => setScreen('email')}
                    onLogin={handleSuccess}
                />
            )}

            {screen === 'register' && (
                <RegisterScreen
                    email={email}
                    onBack={() => setScreen('email')}
                    onRegister={handleSuccess}
                />
            )}
        </div>
    );
}
