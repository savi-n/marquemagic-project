import styled from 'styled-components';

import useForm from '../hooks/useForm';

export default function LoanDetails() {

    const onSubmit = (data) => {
        console.log(data)
    }

    const { register, handleSubmit, formState } = useForm();

    const { submit, error, touched } = formState;
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
                                number: true
                            }
                        })}

                        {
                            (submit?.isSubmited || touched?.password) && (<div>{error?.password}</div>)
                        }

                    </div>

                    <div>
                        {register({
                            name: 'abcd',
                            rules: {
                                required: true
                            }
                        })}

                        {
                            (submit?.isSubmited || touched?.abcd) && (<div>{error?.abcd}</div>)
                        }
                    </div>
                </div>
                <div>
                    <input type='submit' value="submit" />
                </div>
            </form>

            {/* <h3>
                {JSON.stringify(formState)}
            </h3> */}
        </>
    )
}