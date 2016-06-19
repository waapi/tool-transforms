import React from 'react';
import FileSystem from 'systems/FileSystem.js';
import './Page.css';

export default class Preview extends React.Component {
    constructor(props) {
        super(props);
        this.watcher = null;
        this.tid = null;
        this.watchedDependencies = {};
    }
    
    componentWillMount() {}
    componentDidMount() {
        if(this.props.path)
        {
            this.watcher = FileSystem.watch(this.props.path);
            this.watcher.onUpdate = ::this.handleUpdate;
            this.tid = setInterval(::this.checkDependencies, 1000);
        }
    }
    
    componentWillUnmount() {
        if(this.tid)
        {
            clearInterval(this.tid);
            this.tid = null;
        }
        
        if(this.watcher)
        {
            FileSystem.unwatch(this.watcher);
            this.watcher = null;
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if(nextProps.path !== this.props.path)
        {
            if(this.props.path) FileSystem.unwatch(this.watcher);
            this.watcher = nextProps.path? FileSystem.watch(nextProps.path) : null;
        }
    }
    
    componentWillUpdate(nextProps, nextState) {}
    componentDidUpdate(prevProps, prevState) {}
    
    checkDependencies() {
        if(!(this.props.path && this._iframe && this._iframe.contentWindow)) return;
        
        // Select all <link href>s
        var elements = this._iframe.contentWindow.document.querySelectorAll('link[href]');
        
        // Filter down to local files
        var files = Array.prototype.slice.call(elements)
        .map(element => new URL(element.href))
        .filter(url => url.origin == location.origin && url.pathname.startsWith('/live/'))
        .map(url => url.pathname.replace('/live', ''));
        
        // Check for added dependencies
        files
        .filter(path => !(path in this.watchedDependencies))
        .forEach(path => {
            console.log('Added dependency:', path);
            var watcher = FileSystem.watch(path);
            watcher.on = (event) => console.log(event);
            watcher.onUpdate = ::this.handleUpdateDependency;
            this.watchedDependencies[path] = watcher;
        });
        
        // Check for removed dependencies
        Object.keys(this.watchedDependencies)
        .filter(path => files.indexOf(path) === -1)
        .forEach(path => {
            console.log('Removed dependency:', path);
            var watcher = this.watchedDependencies[path];
            FileSystem.unwatch(watcher);
            delete this.watchedDependencies[path];
        });
    }
    
    handleUpdate(event) {
        if(this._iframe)
        {
            // this._iframe.contentWindow.location.reload();
            
            fs.read(event.path).then((html) => {
                if(html.indexOf)
                html = '<base href="/live/"/>' + html;
                this._iframe.contentDocument.open();
                this._iframe.contentDocument.write('');
                this._iframe.contentDocument.write(html);
                this._iframe.contentDocument.close();
            });
        }
    }
    
    handleUpdateDependency(event) {
        var path = event.path.slice(1);
        
        // Select <link href> responsible
        var element = this._iframe.contentWindow.document.querySelector(`link[href^="${path}"]`);
        element.href = path + '?' + (new Date()).toString();
        
        // console.log('Dependency was updated:', element.href);
    }
    
    render() {
        if(!this.props.path) return (
            null
        );
        
        return (
            <div className="preview page">
				{/*<header className="location">
					<span className="bar">{location.origin + '/live' + this.props.path}</span>
				</header>*/}
                <iframe
                    ref={c => this._iframe = c}
                    className="preview"
                    allowfullscreen="true"
                    allowtransparency="true"
                    sandbox="allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                    src={'/live' + this.props.path}
                ></iframe>
            </div>
        )
    }
}
