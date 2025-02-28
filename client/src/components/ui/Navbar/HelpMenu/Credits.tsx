const Credits = () => {
    return (
        <div className="pb-12">
            <div className='p-4 flex flex-row gap-24 justify-center'>
                <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <img src={`/logo-light.png`} alt="Logo" className="h-14 p-4" />
                        IMF Editor - 2025 Team
                    </h2>
                    <ul className="list-disc pl-16 space-y-1">
                        <li>Eskil Ekaas Schjong</li>
                        <li>Filip Byrjall Eriksen</li>
                        <li>Lars Fredrik Dramdal Imsland</li>
                        <li>Muhammad Fazlur Rahman</li>
                    </ul>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <img src={`/logo-2024.png`} alt="Logo" className="h-14 p-4" />
                        Node Editor 3900 - 2024 Team
                    </h2>
                    <ul className="list-disc pl-16 space-y-1">
                        <li>Ali Haider Khan</li>
                        <li>Ali Nasir</li>
                        <li>Håkon Skaftun</li>
                        <li>Mathias Christoffer Kolberg</li>
                        <li>Oliver Berg Preber</li>
                    </ul>
                </div>
            </div>
            <div className='p-4 flex flex-row gap-24 justify-center'>
                <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <img src={`/logo-oslomet.png`} alt="Logo" className="h-14 p-4" />
                        OsloMet - Internal Supervisor
                    </h2>
                    <ul className="list-disc pl-16 space-y-1">
                        <li>Baifan Zhou</li>
                    </ul>
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <img src={`/logo-siriuslabs.png`} alt="Logo" className="h-14 p-4" />
                        Sirius Labs - Contact Person
                    </h2>
                    <ul className="list-disc pl-16 space-y-1">
                        <li>Yuanwei Qu</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default Credits;