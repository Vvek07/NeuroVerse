from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from io import BytesIO
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

def create_feature_importance_chart(feature_importance: dict) -> BytesIO:
    """Create feature importance bar chart"""
    fig, ax = plt.subplots(figsize=(8, 5))
    
    # Sort by importance
    sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    features = [f[0] for f in sorted_features]
    importance = [f[1] for f in sorted_features]
    
    # Create bar chart
    ax.barh(features, importance, color='#1976d2')
    ax.set_xlabel('Importance Score', fontsize=12)
    ax.set_title('Feature Importance', fontsize=14, fontweight='bold')
    ax.grid(axis='x', alpha=0.3)
    
    plt.tight_layout()
    
    # Save to BytesIO
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plt.close()
    
    return buffer

def generate_prediction_report(
    prediction_data: dict,
    user_info: dict,
    dataset_info: dict
) -> BytesIO:
    """Generate PDF report for prediction results"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1976d2'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#424242'),
        spaceAfter=12
    )
    
    # Title
    story.append(Paragraph("Nose-to-Brain Drug Delivery", title_style))
    story.append(Paragraph("Prediction Report", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Report metadata
    metadata_data = [
        ["Report Generated:", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["User:", user_info.get('name', 'N/A')],
        ["Dataset:", dataset_info.get('file_name', 'N/A')],
        ["Total Drugs Analyzed:", str(len(prediction_data.get('predictions', [])))],
    ]
    
    metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e3f2fd')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    story.append(metadata_table)
    story.append(Spacer(1, 0.5*inch))
    
    # Summary section
    story.append(Paragraph("Executive Summary", heading_style))
    
    summary = prediction_data.get('summary', {})
    summary_text = f"""
    This report presents the predicted nose-to-brain delivery efficiency for {summary.get('total_drugs', 0)} drugs.
    The average predicted efficiency is {summary.get('avg_efficiency', 0):.2f}%, with a range from 
    {summary.get('min_efficiency', 0):.2f}% to {summary.get('max_efficiency', 0):.2f}%.
    """
    
    story.append(Paragraph(summary_text, styles['BodyText']))
    story.append(Spacer(1, 0.3*inch))
    
    # Insights
    story.append(Paragraph("Key Insights", heading_style))
    
    insights = prediction_data.get('insights', [])
    for insight in insights:
        story.append(Paragraph(f"• {insight}", styles['BodyText']))
        story.append(Spacer(1, 0.1*inch))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Feature Importance Chart
    if prediction_data.get('feature_importance'):
        story.append(Paragraph("Feature Importance Analysis", heading_style))
        
        chart_buffer = create_feature_importance_chart(prediction_data['feature_importance'])
        chart_image = Image(chart_buffer, width=6*inch, height=3.5*inch)
        story.append(chart_image)
        story.append(Spacer(1, 0.3*inch))
    
    # Prediction Results Table
    story.append(PageBreak())
    story.append(Paragraph("Detailed Prediction Results", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Create table data
    predictions = prediction_data.get('predictions', [])[:20]  # Limit to top 20
    
    table_data = [
        ["Drug Name", "Predicted Efficiency (%)", "Confidence (%)"]
    ]
    
    for pred in predictions:
        table_data.append([
            pred.get('drug_name', 'N/A'),
            f"{pred.get('predicted_efficiency', 0):.2f}",
            f"{pred.get('confidence_score', 0):.2f}"
        ])
    
    predictions_table = Table(table_data, colWidths=[3*inch, 2*inch, 1.5*inch])
    predictions_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
    ]))
    
    story.append(predictions_table)
    
    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_text = """
    <i>This report was generated by the AI-Powered Nose-to-Brain Drug Delivery Prediction System.
    The predictions are based on machine learning models trained on pharmaceutical data and should be
    validated through experimental studies.</i>
    """
    story.append(Paragraph(footer_text, styles['Italic']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer

def generate_comparison_report(
    comparison_data: dict,
    user_info: dict
) -> BytesIO:
    """Generate PDF report for drug comparison"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1976d2'),
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    story.append(Paragraph("Drug Comparison Report", title_style))
    story.append(Spacer(1, 0.5*inch))
    
    # Drugs being compared
    drug1 = comparison_data.get('drug1', {})
    drug2 = comparison_data.get('drug2', {})
    
    comparison_intro = f"""
    <b>Drug 1:</b> {drug1.get('drug_name', 'N/A')}<br/>
    <b>Drug 2:</b> {drug2.get('drug_name', 'N/A')}<br/>
    <b>Winner:</b> {comparison_data.get('winner', 'N/A')}<br/>
    <b>Efficiency Difference:</b> {comparison_data.get('efficiency_difference', 0):.2f}%
    """
    
    story.append(Paragraph(comparison_intro, styles['BodyText']))
    story.append(Spacer(1, 0.3*inch))
    
    # Comparison table
    comparison_table_data = [
        ["Metric", drug1.get('drug_name', 'Drug 1'), drug2.get('drug_name', 'Drug 2')],
        ["Predicted Efficiency (%)", 
         f"{drug1.get('predicted_efficiency', 0):.2f}",
         f"{drug2.get('predicted_efficiency', 0):.2f}"],
        ["Confidence Score (%)",
         f"{drug1.get('confidence_score', 0):.2f}",
         f"{drug2.get('confidence_score', 0):.2f}"]
    ]
    
    comp_table = Table(comparison_table_data, colWidths=[2.5*inch, 2*inch, 2*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
    ]))
    
    story.append(comp_table)
    story.append(Spacer(1, 0.5*inch))
    
    # Analysis
    story.append(Paragraph("Detailed Analysis", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    
    analysis = comparison_data.get('comparison_analysis', '')
    story.append(Paragraph(analysis.replace('\n', '<br/>'), styles['BodyText']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer

def generate_drug_analysis_report(
    drug_name: str,
    prediction_data: dict,
    recommendations: list,
    feature_importance: dict,
    user_info: dict
) -> BytesIO:
    """Generate PDF report for single drug analysis"""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1976d2'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#424242'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph("Nose-to-Brain Drug Delivery", title_style))
    story.append(Paragraph("Analysis Report", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Report metadata
    current_time = datetime.now()
    metadata_data = [
        ["Report Generated:", current_time.strftime("%Y-%m-%d %H:%M:%S")],
        ["User:", user_info.get('name', 'N/A')],
        ["Drug Analyzed:", drug_name],
    ]
    
    metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e3f2fd')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    
    story.append(metadata_table)
    story.append(Spacer(1, 0.4*inch))
    
    # Prediction Results Section
    story.append(Paragraph("Prediction Results", heading_style))
    
    efficiency = prediction_data.get('predicted_efficiency', 0)
    confidence = prediction_data.get('confidence_score', 0)
    
    results_data = [
        ["Metric", "Value"],
        ["Predicted Efficiency", f"{efficiency}%"],
        ["Confidence Score", f"{confidence}%"],
        ["Classification", "High" if efficiency > 70 else "Moderate" if efficiency > 40 else "Low"]
    ]
    
    results_table = Table(results_data, colWidths=[3*inch, 3*inch])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
    ]))
    
    story.append(results_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Drug Properties
    story.append(Paragraph("Drug Properties", heading_style))
    
    properties = prediction_data.get('properties', {})
    prop_data = [["Property", "Value"]]
    
    for key, value in properties.items():
        prop_data.append([key, f"{value:.3f}"])
    
    prop_table = Table(prop_data, colWidths=[3*inch, 2*inch])
    prop_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976d2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')])
    ]))
    
    story.append(prop_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Feature Importance Chart
    if feature_importance:
        story.append(PageBreak())
        story.append(Paragraph("Feature Importance Analysis", heading_style))
        
        chart_buffer = create_feature_importance_chart(feature_importance)
        chart_image = Image(chart_buffer, width=6*inch, height=3.5*inch)
        story.append(chart_image)
        story.append(Spacer(1, 0.3*inch))
    
    # Recommendations
    if recommendations:
        story.append(Paragraph("AI Recommendations", heading_style))
        
        for rec in recommendations:
            story.append(Paragraph(f"• {rec}", styles['BodyText']))
            story.append(Spacer(1, 0.1*inch))
        
        story.append(Spacer(1, 0.3*inch))
    
    # Footer
    story.append(Spacer(1, 0.5*inch))
    footer_text = """
    <i>This report was generated by the AI-Powered Nose-to-Brain Drug Delivery Prediction System.
    The predictions are based on machine learning models (Random Forest) and should be
    validated through experimental studies.</i>
    """
    story.append(Paragraph(footer_text, styles['Italic']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer

