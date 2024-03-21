import * as React from "react";

import TServiceMessage              from "../../types/TServiceMessage";
import apiDataContext               from "../../contexts/api_data/store/context";
import { context as authContext }   from "../../contexts/auth/store/context";
import IServiceMessage              from "../../types/applicationEvent/IServiceMessage";
import Notification                 from "../common/notifications/Notification";
import { EReportDevBarMessageType } from "../../types/applicationEvent/EReportDevBarMessageType";
import { Messages }                 from "primereact/messages";

const ServiceMessages: React.FC = (): React.ReactElement => {

    const {state: apiDataState} = React.useContext(apiDataContext);
    const {state: authState} = React.useContext(authContext);
    const [messages, setMessages] = React.useState<IServiceMessage[]>([]);

    // Handle ServiceMessage display.
    //
    React.useEffect(() => {

        const serviceMessageIdsRead: Array<number> = JSON.parse(String(localStorage.getItem('serviceMessageRead'))) || [];

        if (serviceMessageIdsRead.length < apiDataState.serviceMessages.length) {

            const serviceMessages: IServiceMessage[] =
                apiDataState.serviceMessages
                    // remove read messages
                    .filter(message => !serviceMessageIdsRead.some(value => message.id === value))
                    // keep messages for the current organization
                    .filter(message => message.organizations.some(org => org.id === authState.user.organization_user.organization_id))
                    .map((serviceMessage: TServiceMessage) => {
                        return {
                            severity: 'info',
                            title: serviceMessage.title,
                            message: serviceMessage.contents,
                            serviceMessageId: serviceMessage.id,
                            timestamp: serviceMessage.id,
                        }
                    });

            setMessages(serviceMessages);

        }
    }, [apiDataState.serviceMessages, authState.user.organization_user.organization_id]);

    const deleteMessage = (message: IServiceMessage) => {

        setMessages(prevMessages => prevMessages.filter(m => m.serviceMessageId !== message.serviceMessageId));
        const serviceMessageIdsRead: Array<number> = JSON.parse(String(localStorage.getItem('serviceMessageRead'))) || [];
        serviceMessageIdsRead.push(Number(message.serviceMessageId));
        localStorage.setItem('serviceMessageRead', JSON.stringify(serviceMessageIdsRead));
    };

    return (
        <div className="service-messages">
            {/* I'm here only to load css styles */}
            <Messages/>
            {messages.map((message) => {
                const {serviceMessageId, ...notification} = message;
                return (
                    <Notification
                        notification={{...notification, toast: false, type: EReportDevBarMessageType.LOG}}
                        key={notification.timestamp}
                        onClose={() => deleteMessage(message)}
                        onMouseOver={() => null}
                    />
                );
            })}
        </div>
    )
}

export default ServiceMessages;
