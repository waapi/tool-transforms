import 'css/Root.css';
import React from 'react';
import TransformsInspector from 'components/inspector/Transforms.js';
import AutosizeInput from 'react-input-autosize';



export default class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transform:
                // 'rotate(45deg) scaleY(0.5) rotate(-45deg)',
                'rotate(50deg) translateY(50%) rotate(-75deg) translateY(-60%) rotate(30deg) scale(0.5)',
                // 'rotate(50deg) translateY(-100%) scale(0.5) rotate(30deg) translateY(100%) scaleY(0.4) translate(4em, 4em) rotate(-30deg)',
            reference: null
        };
    }
    
    componentDidMount() {
        this.setState({
            reference: this.foo
        });
    }
    
    handleInput(event) {
        this.setState({ transform: event.target.value });
    }
    
    render() {
        return (
            <div className="app-root">
                <nav className="controls">
                    <span className="foo"><span className="selector">.foo</span>{' { '}<span className="property">transform</span>: <span className="value"><AutosizeInput type="text" spellCheck="false" onChange={::this.handleInput} value={this.state.transform}/></span>{'; }'}</span>
                </nav>
                <div
                    ref={c => this.foo = c}
                    className="foo"
                    style={{ transform: this.state.transform }}
                />
                <TransformsInspector
                    transform={this.state.transform}
                    reference={this.state.reference}
                />
            </div>
        );
    }
}
