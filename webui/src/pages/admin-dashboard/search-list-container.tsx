/********************************************************************************
 * Copyright (c) 2020 TypeFox and others
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 ********************************************************************************/

import { FunctionComponent, ReactNode } from 'react';
import { Grid, Stack } from '@mui/material';
import { DelayedLoadIndicator } from '../../components/delayed-load-indicator';

export const SearchListContainer: FunctionComponent<SearchListContainerProps> = props => {
    return (
        <Stack spacing={2} sx={{ flexWrap: 'nowrap', mb: 4 }}>
            <Stack style={{ flex: 1 }} spacing={1} sx={{ justifyContent: 'flex-end' }}>
                {props.searchContainer.map((searchField, key) => {
                    return (
                        <Grid
                            key={key}
                            container
                            sx={{
                                justifyContent: 'center'
                            }}>
                            <Grid size={8}>{searchField}</Grid>
                        </Grid>
                    );
                })}
            </Stack>
            <Grid
                style={{ flex: 4, overflow: 'hidden' }}
                container
                sx={{
                    justifyContent: 'center'
                }}>
                <Grid style={{ height: '100%' }} size={8}>
                    <DelayedLoadIndicator loading={props.loading} />
                    {props.listContainer}
                </Grid>
            </Grid>
        </Stack>
    );
};

export interface SearchListContainerProps {
    searchContainer: ReactNode[];
    listContainer: ReactNode;
    loading: boolean;
}
