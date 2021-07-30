import { useEffect, useState } from "react";
import ButtonS from "../../components/Button"
import {
    getLoanDetails,
    getLoan,
} from "../utils/requests";


export default function Collateral({collateral, loanId, product, onUpdate,disabled}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState(null);
    const [formValues, setFormValues] = useState({});
    const onfieldChanges = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    useEffect(() => {
        console.log(collateral);
        setLoading(true);
        getLoanDetails(loanId).then((loanDetails) => {
            if (loanDetails) {
                setData(loanDetails);
            }
            setLoading(false);
                
            if (loanDetails) {
                getLoan().then((resp) => {
                resp.data?.map(
                    (k) =>
                    product.includes(k?.name) &&
                    Object.keys(k.product_id).map(
                        (y) =>
                        y === loanDetails.directors[0].income_type &&
                        getLoan(k.id).then((res) => {
                            res.length > 7 && setFields(res);
                            console.log("! ",res);
                        })
                    )
                );
            });
          }
        });
        
      }, []);

    const gateway = data => {
    
        if(data.type === 'select') {
            return <select onChange={onfieldChanges} className='p-2 rounded-md text-lg border w-full'>
                {data.options.map(op => <option name={op.name} value={op.value} >{op.name}</option>)}
            </select>
        } else {
            return <input name={data.name} onChange={onfieldChanges} className='p-2 rounded-md text-lg border w-full' type={data.type} placeholder={data.placeholder} />

        }
    }

    const update = (val) => {
        const jsonStr = JSON.stringify(val);
        onUpdate(jsonStr);
    }

    return (
        <div>
           <section className="flex flex-col gap-y-5 w-8/12">
                <div className="text-blue-600 font-medium text-xl py-8">
                    Collateral details
                </div>

                <div>
                {Object.keys(collateral).map(function(key) {
                    return <div>{key} : {collateral[key]}</div>;
                })}
                </div>             
              
                {console.log(fields)}
                {fields &&
                    fields?.map(el => el.id === 'security-details' && <section className='flex flex-col gap-y-4'>
                        {
                            Object.keys(el.fields).map(item => el.fields[item].label === 'Collateral Details' &&
                                el.fields[item].data.map(e => <section className='w-full flex gap-y-4 items-center justify-evenly'>   
                                    <label className='w-full text-lg'>{e.placeholder}</label>
                                    {gateway(e)}
                                </section>)
                            )
                        }
                    </section>)
                }
            </section>
            <ButtonS
                    type="submit"
                    name="Update"
                    fill
                    onClick={update({formValues:'set form values'})}
            />
        </div>

    )
}