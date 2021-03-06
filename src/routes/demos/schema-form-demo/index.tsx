import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import "../dist/antd";
import { createForm, SchemaForm } from 'rehooker-schema-form';
import { schema } from "./schema-example";
// require("antd/dist/antd.css");
// require("../styles/antd-components.css");

const form = createForm()

export default class App extends React.PureComponent<any,any>{
    state={
        data:{
            state:2,
            "dependant_lv1": "animal",
            "dependant_lv2": "dog",
            "select": "pear",
            select1:0,
        }
    }
    onSubmit=async (values:any)=>{
        console.log(values)
        this.setState({
            data:values
        })
    };
    render(){
        return <div style={{padding:15}}>
            <SchemaForm form={form} initialValues={this.state.data} schema={schema} onSubmit={this.onSubmit} />
            <p>诸如数据schema发生变化的需求，不应该由表单这一层来实现！应该是逻辑层实现的功能，这里的表单只要笨笨的就行了</p>
            <pre>
                <code>
                data:{
                    JSON.stringify(this.state.data,null,"\t")
                }
                </code>
            </pre>

        </div>
    }
}