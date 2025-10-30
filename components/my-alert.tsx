
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';


interface AlertBoxParams {
    title : string
    description : string
    onYes : () => void
}

export const AlertBox : React.FC<AlertBoxParams> = (props) => {
    return (
    <AlertDialog>
        <AlertDialogTrigger>
            <Text>Show Alert Dialog</Text>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{props.title}</AlertDialogTitle>
                <AlertDialogDescription>
                    {props.description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel >
                    <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction onPress={props.onYes}>
                    <Text>Continue</Text>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>)

}


