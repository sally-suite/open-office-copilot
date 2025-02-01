import { useContext } from 'react'
import { UserContext } from '../store/userContext'

export default function useUserState() {
    const state = useContext(UserContext);
    return state;
}