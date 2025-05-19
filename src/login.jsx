import React, { useContext, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import background from './login.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState('');

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="text-center bg-white bg-opacity-90 p-8 rounded-lg">
        <h1 className="text-3xl text-lime-600 italic">Connexion</h1>

        <Formik
          initialValues={{
            upn: '',
            password: '',
          }}
          validate={(values) => {
            const errors = {};
            if (!values.upn) {
              errors.upn = "Identifiant requis";
            }
            if (!values.password) {
              errors.password = 'Mot de passe requis';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await login({
                username: values.upn,
                password: values.password,
              });
              navigate('/');
            } catch (error) {
              setError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="mt-6">
              {error && (
                <div className="text-red-500 mb-4 p-2 bg-red-100 rounded">
                  {error}
                </div>
              )}
              <div className="grid gap-4">
                <div className="space-y-4">
                  <div className="grid">
                    <Field
                      className="h-[60px] w-[432px] mt-2 rounded-[7px] border border-gray-300 pl-3"
                      type="text"
                      id="upn"
                      placeholder="Identifiant"
                      name="upn"
                    />
                    <ErrorMessage
                      name="upn"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div className="grid">
                    <Field
                      className="h-[60px] w-[432px] mt-2 rounded-[7px] border border-gray-300 pl-3"
                      type="password"
                      id="password"
                      placeholder="Mot de passe"
                      name="password"
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div>
                    <button
                      className="px-5 py-4 rounded-[7px] bg-lime-700 text-center text-white disabled:opacity-50"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Connexion...' : 'Se connecter'}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;