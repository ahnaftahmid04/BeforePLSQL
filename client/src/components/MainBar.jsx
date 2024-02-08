import '../styles/mainbar.css';

export default function MainBar({children}) {
    return (
        <div className="mainbar">
            <div className="mainbarWrapper">
                {children}
            </div>
        </div>
    )
}