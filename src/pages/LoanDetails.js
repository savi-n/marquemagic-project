import styled from 'styled-components';

import useForm from '../hooks/useForm';

export default function LoanDetails() {

    const onSubmit = (data) => {
        console.log(data)
    }

    const { register, handleSubmit, formState } = useForm();

    const { submit, error, touched, values, valid } = formState;
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div>
                        {register({
                            name: 'email',
                            rules: {
                                required: true,
                                email: true
                            }
                        })}
                        {
                            (submit?.isSubmited || touched?.email) && (<div>{error?.email}</div>)
                        }

                    </div>
                    <div>
                        {register({
                            name: 'password',
                            type: 'password',
                            rules: {
                                required: true,
                                number: true,
                                length: 4
                            }
                        })}

                        {
                            (submit?.isSubmited || touched?.password) && (<div>{error?.password}</div>)
                        }

                    </div>

                    <div>
                        {values.select === '1' && register({
                            name: 'abcd',
                            placeholder: 'Place-holder',
                            rules: {
                                ...values.select === '1' ? {
                                    required: true,
                                    valueMatchWith: values.email
                                } : {},

                            }
                        })}

                        {
                            (submit?.isSubmited || touched?.abcd) && (<div>{error?.abcd}</div>)
                        }
                    </div>

                    {register({
                        type: 'select',
                        name: 'select',
                        options: [{ name: 'a', value: 1 }, { name: 'b', value: 2 }],
                        style: {
                            background: 'green'
                        },
                        rules: {
                            required: true,
                        }
                    })}
                    {
                        (submit?.isSubmited || touched?.select) && (<div>{error?.select}</div>)
                    }
                </div>
                <div>
                    <input type='submit' value="submit" />
                </div>

            </form>

            <h3>
                {JSON.stringify(error)}
            </h3>
        </>
    )
}