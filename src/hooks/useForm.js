import { useState, useCallback, useRef } from "react";
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';


const Input = styled.input`
    height: 50px;
`;

function required(value) {
    return !value
}

function numberOnly(value) {
    return !Number(value)
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return !re.test(email);
}

const VALIDATION_RULES = {
    required: {
        func: required,
        message: 'Required Field'
    },
    number: {
        func: numberOnly,
        message: 'Numbers only Allowed'
    },
    email: {
        func: validateEmail,
        message: 'Invalid Email Address'
    }
}


function validate(rules, value) {
    if (!rules) return false;

    for (let rule of Object.keys(rules)) {
        if (rules[rule]) {
            if (VALIDATION_RULES[rule].func(value, rules[rule])) {
                return VALIDATION_RULES[rule].message;
            }
        }
    }
}

const invalidDefault = () => {
    console.log('Invalid Data--> Please check you form');
}

const validDefault = (formData) => {
    console.log('Form Valid ----------->');
    console.table(formData);
}


export default function useForm() {
    const formRef = useRef('');

    const fieldsRef = useRef({});
    const valuesRef = useRef({});
    const touchedRef = useRef({});
    const errorsRef = useRef({});
    const submitRef = useRef({
        isSubmitting: false,
        isSubmited: false,
        submitCount: 0
    });

    const [, updateFormState] = useState(uuidv4());

    const checkValidity = (name) => {
        const error = validate(fieldsRef.current[name]?.rules, valuesRef.current[name]);
        const { [name]: omit, ...errorFields } = errorsRef.current;
        errorsRef.current = { ...errorFields, ...error ? { [name]: error } : {} };
    }

    const setValue = (name, value) => {
        const updatedValues = { ...valuesRef.current, [name]: value };
        valuesRef.current = updatedValues;
    }

    const register = useCallback((newField) => {
        if (!fieldsRef.current[newField.name]) {
            fieldsRef.current[newField.name] = newField;

            newField.value && setValue(newField.name, newField.value)
            newField.rules && checkValidity(newField.name);
        }

        return (
            <Input
                type={newField.type || 'text'}
                name={newField.name}
                onChange={onChange}
                value={valuesRef.current[newField.name] || ''}
                onBlur={onBlur}
            />
        )
    }, [formRef.current]);

    const onChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;

        setValue(name, value);
        checkValidity(name);

        updateFormState(uuidv4());
    }

    const onBlur = (event) => {
        event.preventDefault();

        const { name } = event.target;

        touchedRef.current = { ...touchedRef.current, [name]: true };

        checkValidity(name);

        updateFormState(uuidv4());
    }

    const handleSubmit = useCallback((valid = validDefault, invalid = invalidDefault) => async e => {

        const { submitCount } = submitRef.current;

        submitRef.current = {
            isSubmitting: true,
            isSubmited: true,
            submitCount: submitCount + 1
        };

        updateFormState(uuidv4());

        if (e) {
            e.preventDefault && e.preventDefault();
            e.persist && e.persist();
        }

        if (!Object.keys(errorsRef.current).length) {
            await valid(valuesRef.current);
        } else { await invalid(valuesRef.current); }

        submitRef.current = {
            ...submitRef.current, isSubmitting: false
        };

        updateFormState(uuidv4());

    }, [formRef.current]);

    return {
        register,
        handleSubmit,
        formState: {
            touched: touchedRef.current,
            error: errorsRef.current,
            submit: submitRef.current,
        },
    }
}
