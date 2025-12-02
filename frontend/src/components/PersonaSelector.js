import React from 'react';
import {
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Box,
    Paper,
    Tooltip
} from '@mui/material';
import {
    Science as ScienceIcon,
    Psychology as BrainIcon,
    Gavel as LawIcon,
    School as MentorIcon
} from '@mui/icons-material';

const personas = [
    {
        value: 'Formulation Scientist',
        label: 'Formulation Scientist',
        icon: <ScienceIcon />,
        description: 'Focuses on solubility, stability, excipients, and delivery systems.'
    },
    {
        value: 'Nasal-to-Brain Delivery Expert',
        label: 'N2B Expert',
        icon: <BrainIcon />,
        description: 'Focuses on BBB permeability, mucociliary clearance, and nasal pathways.'
    },
    {
        value: 'Regulatory/QbD Expert',
        label: 'Regulatory Expert',
        icon: <LawIcon />,
        description: 'Focuses on safety, toxicity (Lipinski), compliance, and quality by design.'
    },
    {
        value: 'Research Mentor',
        label: 'Research Mentor',
        icon: <MentorIcon />,
        description: 'Provides academic guidance, literature context, and next experimental steps.'
    }
];

const PersonaSelector = ({ selectedPersona, onPersonaChange }) => {
    const handleChange = (event, newPersona) => {
        if (newPersona !== null) {
            onPersonaChange(newPersona);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f7fa' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                Select AI Persona Mode:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose an expert persona to tailor the AI insights to your specific needs.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={selectedPersona}
                    exclusive
                    onChange={handleChange}
                    aria-label="persona selector"
                    size="medium"
                    sx={{ flexWrap: 'wrap' }}
                >
                    {personas.map((persona) => (
                        <Tooltip key={persona.value} title={persona.description} arrow placement="top">
                            <ToggleButton value={persona.value} aria-label={persona.label}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 1 }}>
                                    {persona.icon}
                                    <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                                        {persona.label}
                                    </Typography>
                                </Box>
                            </ToggleButton>
                        </Tooltip>
                    ))}
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ mt: 2, p: 1, bgcolor: '#e3f2fd', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="primary.dark">
                    <strong>Current Focus:</strong> {personas.find(p => p.value === selectedPersona)?.description}
                </Typography>
            </Box>
        </Paper>
    );
};

export default PersonaSelector;
