import React from 'react';

interface Props{

    classes:any[];

    onSelect:(id:number)=>void;

}

export function SelectClassModal({

    classes,

    onSelect

}:Props){

    return(

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl p-6 w-full max-w-md">

                <h2 className="text-xl font-bold mb-2">

                    Pilih Kelas

                </h2>

                <p className="text-slate-500 mb-5">

                    Sebelum mulai belajar silakan pilih kelas Anda.

                </p>

                <div className="space-y-3">

                    {classes.map((c:any)=>(

                        <button

                            key={c.id}

                            onClick={()=>onSelect(c.id)}

                            className="w-full border rounded-lg p-3 hover:bg-indigo-50"

                        >

                            {c.name}

                        </button>

                    ))}

                </div>

            </div>

        </div>

    );

}